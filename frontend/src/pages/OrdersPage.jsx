import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'
import { ordersAPI } from '../utils/api'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-canvas-100 text-canvas-700', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',       icon: XCircle },
  refunded:   { label: 'Refunded',   color: 'bg-gray-100 text-gray-600',     icon: XCircle },
}

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.myOrders().then(r => r.data),
  })

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-28 bg-canvas-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-ink mb-8 flex items-center gap-2">
        <ShoppingBag className="w-7 h-7 text-canvas-600" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">📦</div>
          <p className="font-display text-xl text-ink mb-2">No orders yet</p>
          <p className="text-ink-muted mb-6">Your purchased paintings will appear here</p>
          <Link to="/shop" className="btn-primary">Browse Gallery</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const StatusIcon = status.icon
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-bold text-ink">#{order.order_number}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`badge ${status.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </span>
                    <span className={`badge text-xs ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-canvas-100">
                  <div className="text-sm text-ink-muted">
                    <span>{order.shipping_city}, {order.shipping_state}</span>
                    {order.tracking_number && (
                      <span className="ml-3 text-canvas-600 font-medium">
                        🚚 Track: {order.tracking_number}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-canvas-700 text-lg">
                      ₹{order.total?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
