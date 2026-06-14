from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
import uuid
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.utils.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1

@router.get("")
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get all cart items in one query
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    items = result.scalars().all()

    if not items:
        return {"items": [], "subtotal": 0, "count": 0}

    # Fetch all products in a single query (fixes N+1 slow loading)
    product_ids = [item.product_id for item in items]
    prod_result = await db.execute(
        select(Product).where(Product.id.in_(product_ids))
    )
    products_map = {str(p.id): p for p in prod_result.scalars().all()}

    cart_data = []
    subtotal = 0
    for item in items:
        product = products_map.get(str(item.product_id))
        if product:
            line_total = product.price * item.quantity
            subtotal += line_total
            cart_data.append({
                "id": str(item.id),
                "product_id": str(product.id),
                "title": product.title,
                "price": product.price,
                "image": product.images[0] if product.images else None,
                "slug": product.slug,
                "quantity": item.quantity,
                "line_total": line_total,
                "in_stock": product.stock >= item.quantity,
            })

    return {"items": cart_data, "subtotal": subtotal, "count": len(cart_data)}

@router.post("/add")
async def add_to_cart(
    data: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    prod_result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = prod_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < 1:
        raise HTTPException(status_code=400, detail="This painting is sold out")

    existing_result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == data.product_id
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        existing.quantity = min(existing.quantity + data.quantity, product.stock)
        db.add(existing)
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=data.product_id,
            quantity=min(data.quantity, product.stock)
        )
        db.add(cart_item)

    await db.commit()  # FIX: was missing — cart was never saved
    return {"message": "Added to cart"}

class UpdateCartRequest(BaseModel):
    quantity: int

@router.put("/update/{item_id}")
async def update_cart_quantity(
    item_id: str,
    data: UpdateCartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == uuid.UUID(item_id),
            CartItem.user_id == current_user.id
        )
    )
    cart_item = result.scalar_one_or_none()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    prod_result = await db.execute(
        select(Product).where(Product.id == cart_item.product_id)
    )
    product = prod_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.quantity <= 0:
        await db.execute(
            delete(CartItem).where(
                CartItem.id == uuid.UUID(item_id),
                CartItem.user_id == current_user.id
            )
        )
        await db.commit()
        return {"message": "Removed from cart"}

    cart_item.quantity = min(data.quantity, product.stock)
    db.add(cart_item)
    await db.commit()
    return {"message": "Cart updated", "quantity": cart_item.quantity}

@router.delete("/remove/{item_id}")
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        delete(CartItem).where(
            CartItem.id == uuid.UUID(item_id),
            CartItem.user_id == current_user.id
        )
    )
    await db.commit()
    return {"message": "Removed from cart"}

@router.delete("/clear")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))
    await db.commit()
    return {"message": "Cart cleared"}
