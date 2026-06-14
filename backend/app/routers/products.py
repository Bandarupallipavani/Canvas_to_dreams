from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.database import get_db
from app.models.product import Product
from pydantic import BaseModel
from typing import List, Optional
import re, uuid

router = APIRouter()

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text + "-" + str(uuid.uuid4())[:8]

class ProductSchema(BaseModel):
    title: str
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    medium: Optional[str] = None
    size: Optional[str] = None
    images: List[str] = []
    tags: List[str] = []
    stock: int = 1
    is_featured: bool = False
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None

def product_to_dict(p: Product) -> dict:
    return {
        "id": str(p.id),
        "title": p.title,
        "description": p.description,
        "price": p.price,
        "original_price": p.original_price,
        "category": p.category,
        "medium": p.medium,
        "size": p.size,
        "images": p.images or [],
        "tags": p.tags or [],
        "stock": p.stock,
        "is_available": p.is_available,
        "is_featured": p.is_featured,
        "slug": p.slug,
        "views": p.views,
        "instagram_url": p.instagram_url,
        "youtube_url": p.youtube_url,
        "created_at": str(p.created_at),
    }

@router.get("")
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    sort: str = "newest",
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.is_available == True)

    if category:
        query = query.where(Product.category == category)
    if search:
        query = query.where(
            or_(
                Product.title.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.tags.any(search.lower()),
            )
        )
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if featured is not None:
        query = query.where(Product.is_featured == featured)

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "popular":
        query = query.order_by(Product.views.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    return {
        "products": [product_to_dict(p) for p in products],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product.category, func.count(Product.id).label("count"))
        .where(Product.is_available == True)
        .group_by(Product.category)
    )
    return [{"name": row[0], "count": row[1]} for row in result.all()]

@router.get("/{slug}")
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.slug == slug))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Painting not found")
    
    # Increment views
    product.views += 1
    db.add(product)
    return product_to_dict(product)
