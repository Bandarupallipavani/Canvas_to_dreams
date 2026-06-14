from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.utils.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random, string, os

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")

def generate_order_number():
    return "CTD" + ''.join(random.choices(string.digits, k=8))

class CheckoutRequest(BaseModel):
    payment_method: str  # "razorpay", "stripe", "cod"
    shipping_name: str
    shipping_email: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    notes: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    razorpay_signature: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None

def order_to_dict(order: Order, items=None) -> dict:
    data = {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "subtotal": order.subtotal,
        "shipping_cost": order.shipping_cost,
        "tax": order.tax,
        "total": order.total,
        "shipping_name": order.shipping_name,
        "shipping_email": order.shipping_email,
        "shipping_phone": order.shipping_phone,
        "shipping_address": order.shipping_address,
        "shipping_city": order.shipping_city,
        "shipping_state": order.shipping_state,
        "shipping_pincode": order.shipping_pincode,
        "tracking_number": order.tracking_number,
        "notes": order.notes,
        "created_at": str(order.created_at),
    }
    if items:
        data["items"] = [
            {
                "product_id": str(i.product_id),
                "quantity": i.quantity,
                "unit_price": i.unit_price,
                "total_price": i.total_price,
            }
            for i in items
        ]
    return data

@router.post("/checkout")
async def checkout(
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get cart items
    result = await db.execute(select(CartItem).where(CartItem.user_id == current_user.id))
    cart_items = result.scalars().all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = 0.0
    order_items_data = []

    for cart_item in cart_items:
        prod_result = await db.execute(select(Product).where(Product.id == cart_item.product_id))
        product = prod_result.scalar_one_or_none()
        if not product or product.stock < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"'{product.title if product else 'Item'}' is unavailable")
        line_total = product.price * cart_item.quantity
        subtotal += line_total
        order_items_data.append((product, cart_item.quantity, line_total))

    shipping_cost = 0.0 if subtotal >= 2000 else 150.0  # Free shipping above ₹2000
    tax = round(subtotal * 0.00, 2)  # 0% tax (adjust as needed)
    total = subtotal + shipping_cost + tax

    # Create order
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        payment_method=PaymentMethod(data.payment_method),
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        tax=tax,
        total=total,
        shipping_name=data.shipping_name,
        shipping_email=data.shipping_email,
        shipping_phone=data.shipping_phone,
        shipping_address=data.shipping_address,
        shipping_city=data.shipping_city,
        shipping_state=data.shipping_state,
        shipping_pincode=data.shipping_pincode,
        notes=data.notes,
        status=OrderStatus.pending,
        payment_status=PaymentStatus.pending,
    )
    db.add(order)
    await db.flush()  # Get order.id

    for product, qty, line_total in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price,
            total_price=line_total,
        )
        db.add(order_item)
        product.stock -= qty
        db.add(product)

    response = {"order_id": str(order.id), "order_number": order.order_number, "total": total}

    # Razorpay payment order
    if data.payment_method == "razorpay" and RAZORPAY_KEY_ID:
        try:
            import razorpay
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            rz_order = client.order.create({
                "amount": int(total * 100),  # paise
                "currency": "INR",
                "receipt": order.order_number,
            })
            order.payment_id = rz_order["id"]
            response["razorpay_order_id"] = rz_order["id"]
            response["razorpay_key"] = RAZORPAY_KEY_ID
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")

    # Stripe payment intent
    elif data.payment_method == "stripe" and STRIPE_SECRET_KEY:
        try:
            import stripe
            stripe.api_key = STRIPE_SECRET_KEY
            intent = stripe.PaymentIntent.create(
                amount=int(total * 100),
                currency="inr",
                metadata={"order_id": str(order.id)},
            )
            order.payment_id = intent["id"]
            response["stripe_client_secret"] = intent["client_secret"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

    elif data.payment_method == "cod":
        order.status = OrderStatus.confirmed
        order.payment_status = PaymentStatus.pending
        # Clear cart for COD immediately
        await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))

    db.add(order)
    return response

@router.post("/verify-payment")
async def verify_payment(
    data: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).where(Order.id == data.order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if data.razorpay_signature and RAZORPAY_KEY_SECRET:
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": order.payment_id,
                "razorpay_payment_id": data.payment_id,
                "razorpay_signature": data.razorpay_signature,
            })
        except Exception:
            raise HTTPException(status_code=400, detail="Payment signature verification failed")

    order.payment_status = PaymentStatus.paid
    order.status = OrderStatus.confirmed
    order.payment_id = data.payment_id
    db.add(order)

    # Clear cart
    await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))
    return {"message": "Payment verified", "order_number": order.order_number}

@router.get("/my-orders")
async def my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return [order_to_dict(o) for o in orders]

@router.get("/{order_id}")
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    items = items_result.scalars().all()
    return order_to_dict(order, items)
