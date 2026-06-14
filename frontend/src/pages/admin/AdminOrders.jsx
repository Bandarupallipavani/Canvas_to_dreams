import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../utils/api'
import toast from 'react-hot-toast'

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-canvas-100 text-canvas-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const qc = useQueryClient()
  const [editOrder, setEditOrder] = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: '', tracking_number: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminAPI.listOrders().then(r => r.data),
  })

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const openEdit = (order) => {
    setEditOrder(order)
    setUpdateForm({ status: order.status, tracking_number: order.tracking_number || '', notes: order.notes || '' })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.updateOrder(editOrder.id, updateForm)
      qc.invalidateQueries(['admin-orders'])
      toast.success('Order updated!')
      setEditOrder(null)
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">Orders</h1>
        <p className="text-ink-muted mt-1">{orders.length} total orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...ORDER_STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
              filter === s ? 'bg-ink text-white border-ink' : 'border-canvas-200 text-ink-muted hover:border-ink'
            }`}>
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Desktop Order Table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas-50">
                {['Order', 'Customer', 'City', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-ink-muted font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-canvas-100 rounded animate-pulse w-16" />
                    </td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-ink-muted">No orders found</td></tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.id} className="hover:bg-canvas-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">#{order.order_number}</td>
                    <td className="px-4 py-3 text-ink-muted max-w-[120px] truncate">{order.shipping_name}</td>
                    <td className="px-4 py-3 text-ink-muted">{order.shipping_city}</td>
                    <td className="px-4 py-3 font-semibold text-canvas-700">₹{order.total?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'} capitalize`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(order)}
                        className="px-3 py-1 rounded-lg bg-canvas-100 text-canvas-700 hover:bg-canvas-200 text-xs font-medium transition-colors">
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (shown only on mobile) */}
      <div className="space-y-4 md:hidden">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-canvas-100 rounded w-1/3" />
              <div className="h-3 bg-canvas-100 rounded w-1/2" />
              <div className="h-10 bg-canvas-100 rounded-lg" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center text-ink-muted">
            No orders found
          </div>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">#{order.order_number}</span>
                <span className="text-xs text-ink-muted">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div className="space-y-1 text-xs text-ink-muted">
                <p><span className="font-medium text-ink">Customer:</span> {order.shipping_name}</p>
                <p><span className="font-medium text-ink">Location:</span> {order.shipping_city}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-2 border-t border-b border-canvas-50">
                <div>
                  <p className="text-ink-muted">Total</p>
                  <p className="font-bold text-canvas-700 mt-0.5">₹{order.total?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Payment</p>
                  <span className={`badge mt-0.5 text-[9px] px-2 py-0 ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-ink-muted">Status</p>
                  <span className={`badge mt-0.5 text-[9px] px-2 py-0 capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => openEdit(order)}
                  className="px-4 py-2 rounded-lg bg-canvas-100 text-canvas-700 hover:bg-canvas-200 text-xs font-semibold transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditOrder(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-display font-bold text-lg text-ink mb-1">Update Order</h2>
            <p className="text-sm text-ink-muted mb-5">#{editOrder.order_number} — {editOrder.shipping_name}</p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Status</label>
                <select value={updateForm.status}
                  onChange={e => setUpdateForm(p => ({ ...p, status: e.target.value }))}
                  className="input capitalize">
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Tracking Number</label>
                <input type="text" value={updateForm.tracking_number}
                  onChange={e => setUpdateForm(p => ({ ...p, tracking_number: e.target.value }))}
                  placeholder="e.g. BD123456789IN" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Internal Notes</label>
                <textarea value={updateForm.notes}
                  onChange={e => setUpdateForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="input resize-none" placeholder="Notes about this order..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditOrder(null)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
