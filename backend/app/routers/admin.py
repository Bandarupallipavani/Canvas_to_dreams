from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.database import get_db
from app.models.product import Product
from app.models.order import Order, OrderStatus, OrderItem
from app.models.user import User
from app.utils.auth import get_admin_user
from app.routers.products import ProductSchema, slugify, product_to_dict
from app.routers.orders import order_to_dict
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import uuid

router = APIRouter()

class UpdateOrderRequest(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None

# ── Dashboard ─────────────────────────────────────────────
@router.get("/dashboard")
async def dashboard(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    total_products = await db.execute(select(func.count(Product.id)))
    total_orders = await db.execute(select(func.count(Order.id)))
    total_revenue = await db.execute(select(func.sum(Order.total)).where(Order.payment_status == "paid"))
    recent_orders = await db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(5)
    )

    # Orders last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_orders = await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= thirty_days_ago)
    )

    return {
        "total_products": total_products.scalar() or 0,
        "total_orders": total_orders.scalar() or 0,
        "total_revenue": total_revenue.scalar() or 0,
        "monthly_orders": monthly_orders.scalar() or 0,
        "recent_orders": [order_to_dict(o) for o in recent_orders.scalars().all()],
    }

# ── Product CRUD ──────────────────────────────────────────
@router.get("/products")
async def admin_list_products(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).order_by(Product.created_at.desc()))
    products = result.scalars().all()
    return [product_to_dict(p) for p in products]

@router.post("/products")
async def create_product(
    data: ProductSchema,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    slug = slugify(data.title)
    product = Product(
        **data.dict(),
        slug=slug,
        is_available=True,
    )
    db.add(product)
    await db.commit()  # FIX: was missing
    await db.refresh(product)
    return product_to_dict(product)

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    data: ProductSchema,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in data.dict().items():
        setattr(product, field, value)
    product.updated_at = datetime.utcnow()
    db.add(product)
    await db.commit()  # FIX: was missing
    await db.refresh(product)
    return product_to_dict(product)

@router.patch("/products/{product_id}/toggle")
async def toggle_product(
    product_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_available = not product.is_available
    db.add(product)
    await db.commit()  # FIX: was missing
    return {"is_available": product.is_available}

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(delete(Product).where(Product.id == product_id))
    await db.commit()  # FIX: was missing
    return {"message": "Product deleted"}

# ── Order Management ──────────────────────────────────────
@router.get("/orders")
async def admin_list_orders(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return [order_to_dict(o) for o in result.scalars().all()]

@router.patch("/orders/{order_id}")
async def update_order(
    order_id: str,
    data: UpdateOrderRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if data.status:
        order.status = OrderStatus(data.status)
    if data.tracking_number:
        order.tracking_number = data.tracking_number
    if data.notes:
        order.notes = data.notes
    order.updated_at = datetime.utcnow()
    db.add(order)
    await db.commit()  # FIX: was missing
    await db.refresh(order)
    return order_to_dict(order)

# ── Users ─────────────────────────────────────────────────
@router.get("/users")
async def admin_list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "phone": u.phone,
            "created_at": str(u.created_at),
        }
        for u in users
    ]
