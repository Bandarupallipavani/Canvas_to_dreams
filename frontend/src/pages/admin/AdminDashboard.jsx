import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../utils/api'
import { Package, ShoppingBag, Users, IndianRupee, TrendingUp, Clock } from 'lucide-react'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-canvas-100 text-canvas-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.dashboard().then(r => r.data),
    refetchInterval: 30000,
  })

  const stats = [
    { label: 'Total Paintings', value: data?.total_products ?? '—', icon: Package, color: 'bg-canvas-100 text-canvas-700' },
    { label: 'Total Orders', value: data?.total_orders ?? '—', icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
    { label: 'Revenue', value: data?.total_revenue ? `₹${Number(data.total_revenue).toLocaleString('en-IN')}` : '₹0', icon: IndianRupee, color: 'bg-green-100 text-green-700' },
    { label: 'Orders (30d)', value: data?.monthly_orders ?? '—', icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
        <p className="text-ink-muted mt-1">Canvas to Dreams — Admin Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="font-display text-2xl font-bold text-ink">
              {isLoading ? <div className="h-7 w-20 bg-canvas-100 rounded animate-pulse" /> : value}
            </div>
            <div className="text-sm text-ink-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-canvas-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-canvas-600" />
          <h2 className="font-display font-bold text-ink">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas-50">
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Order</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Customer</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Total</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Status</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-canvas-100 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.recent_orders?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-ink-muted">No orders yet</td>
                </tr>
              ) : (
                data?.recent_orders?.map(order => (
                  <tr key={order.id} className="hover:bg-canvas-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink">#{order.order_number}</td>
                    <td className="px-5 py-3 text-ink-muted">{order.shipping_name}</td>
                    <td className="px-5 py-3 font-semibold text-canvas-700">
                      ₹{order.total?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
