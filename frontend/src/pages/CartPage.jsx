import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { cartAPI } from '../utils/api'
import { useCartStore, useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { isAuthenticated } = useAuthStore()
  const { setCart, removeItem, updateQuantity } = useCartStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.get().then(r => r.data),
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (data?.items) setCart(data.items)
  }, [data])

  const handleRemove = async (itemId) => {
    const previousCart = queryClient.getQueryData(['cart'])

    // 1. Optimistically update Zustand store (for Navbar count)
    removeItem(itemId)

    // 2. Optimistically update React Query cache (for Page list & totals)
    queryClient.setQueryData(['cart'], (oldData) => {
      if (!oldData) return oldData
      const updatedItems = oldData.items.filter(item => item.id !== itemId)
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.line_total, 0)
      return {
        ...oldData,
        items: updatedItems,
        subtotal: newSubtotal
      }
    })

    toast.success('Removed from cart')

    // 3. Trigger API call in background
    try {
      await cartAPI.remove(itemId)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch {
      toast.error('Failed to remove')
      // Rollback Zustand
      if (previousCart?.items) setCart(previousCart.items)
      // Rollback React Query
      queryClient.setQueryData(['cart'], previousCart)
    }
  }

  const handleUpdateQuantity = async (itemId, newQty) => {
    // 1. Optimistically update Zustand local store (for cart badge)
    updateQuantity(itemId, newQty)

    // 2. Optimistically update React Query cache (for page list & totals)
    queryClient.setQueryData(['cart'], (oldData) => {
      if (!oldData) return oldData
      
      let updatedItems = oldData.items.map(item => {
        if (item.id === itemId) {
          const qty = Math.max(0, newQty)
          return {
            ...item,
            quantity: qty,
            line_total: item.price * qty
          }
        }
        return item
      })

      if (newQty <= 0) {
        updatedItems = updatedItems.filter(item => item.id !== itemId)
      }

      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.line_total, 0)

      return {
        ...oldData,
        items: updatedItems,
        subtotal: newSubtotal
      }
    })

    // 3. Trigger API update
    try {
      await cartAPI.update(itemId, newQty)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update quantity')
      refetch() // Rollback on failure
    }
  }

  if (!isAuthenticated) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingBag className="w-16 h-16 text-canvas-200 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-bold text-ink mb-2">Sign in to view your cart</h2>
      <p className="text-ink-muted mb-6">Your cart items will be saved when you sign in</p>
      <Link to="/login" className="btn-primary">Sign In</Link>
    </div>
  )

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-canvas-100 rounded-xl" />
        ))}
      </div>
    </div>
  )

  const items = data?.items || []
  const subtotal = data?.subtotal || 0
  const shipping = subtotal >= 2000 ? 0 : 150
  const total = subtotal + shipping

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-4">🎨</div>
      <h2 className="font-display text-2xl font-bold text-ink mb-2">Your cart is empty</h2>
      <p className="text-ink-muted mb-6">Discover beautiful original paintings to add to your collection</p>
      <Link to="/shop" className="btn-primary">Browse Gallery</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">
        Your Cart <span className="text-ink-muted font-normal text-xl">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/shop/${item.slug}`} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-canvas-50">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎨</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/shop/${item.slug}`} className="font-display font-semibold text-ink hover:text-canvas-700 transition-colors line-clamp-1">
                  {item.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-ink-muted">Qty:</span>
                  <div className="flex items-center border border-canvas-200 rounded-md overflow-hidden bg-white">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-0.5 text-ink-muted hover:bg-canvas-50 hover:text-ink font-semibold transition-colors border-r border-canvas-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-0.5 text-sm font-medium text-ink min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-0.5 text-ink-muted hover:bg-canvas-50 hover:text-ink font-semibold transition-colors border-l border-canvas-200"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="text-canvas-700 font-bold mt-1.5">₹{item.line_total.toLocaleString('en-IN')}</p>
                {!item.in_stock && (
                  <p className="text-blush text-xs mt-1">⚠️ Low stock</p>
                )}
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="p-2 text-ink-muted hover:text-blush hover:bg-red-50 rounded-lg transition-all self-start"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-display font-bold text-lg text-ink mb-4">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-sage font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-canvas-600 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Add ₹{(2000 - subtotal).toLocaleString('en-IN')} more for free shipping
                </p>
              )}
              <hr className="border-canvas-100" />
              <div className="flex justify-between font-bold text-ink text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/shop" className="block text-center text-sm text-ink-muted hover:text-canvas-600 mt-3 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
