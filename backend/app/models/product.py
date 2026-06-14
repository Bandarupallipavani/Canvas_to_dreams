from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)  # for showing discounts
    category = Column(String, nullable=False, index=True)  # e.g. "Abstract", "Portrait", "Landscape"
    medium = Column(String, nullable=True)  # Oil, Acrylic, Watercolor, etc.
    size = Column(String, nullable=True)  # e.g. "24x36 inches"
    images = Column(ARRAY(String), default=[])  # Cloudinary URLs
    tags = Column(ARRAY(String), default=[])
    stock = Column(Integer, default=1)  # Paintings are usually unique (1)
    is_available = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    slug = Column(String, unique=True, nullable=False, index=True)
    instagram_url = Column(String, nullable=True)
    youtube_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
