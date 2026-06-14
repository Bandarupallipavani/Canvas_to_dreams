// ─────────────────────────────────────────────────────────────
// OrderSuccessPage.jsx
// ─────────────────────────────────────────────────────────────
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, Home } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '../utils/api'

export function OrderSuccessPage() {
  const { orderId } = useParams()
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersAPI.get(orderId).then(r => r.data),
  })

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink mb-2">Order Placed! 🎉</h1>
      <p className="text-ink-muted mb-2">
        Thank you for your purchase. Your painting is being prepared with love!
      </p>
      {order && (
        <div className="bg-canvas-50 rounded-xl p-4 mb-8 text-sm">
          <p className="font-medium text-ink">Order #{order.order_number}</p>
          <p className="text-ink-muted mt-1">Total: ₹{order.total?.toLocaleString('en-IN')}</p>
          <p className="text-ink-muted">Shipping to: {order.shipping_city}, {order.shipping_state}</p>
        </div>
      )}
      <div className="flex justify-center gap-3">
        <Link to="/my-orders" className="btn-outline flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Track Order
        </Link>
        <Link to="/" className="btn-primary flex items-center gap-2">
          <Home className="w-4 h-4" /> Home
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccessPage
