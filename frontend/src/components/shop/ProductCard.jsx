import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import { cartAPI } from '../../utils/api'
import { useCartStore, useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getOptimizedImageUrl } from '../../utils/image'
import { useQueryClient } from '@tanstack/react-query'

export default function ProductCard({ product }) {
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in to add to cart')
      navigate('/login')
      return
    }
    // Optimistic Update (Zustand)
    addItem(product)

    // Optimistic Update (React Query Cache)
    queryClient.setQueryData(['cart'], (oldData) => {
      const cartItems = oldData?.items || []
      const existing = cartItems.find(item => item.product_id === product.id)
      let updatedItems
      if (existing) {
        updatedItems = cartItems.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, line_total: item.price * (item.quantity + 1) }
            : item
        )
      } else {
        updatedItems = [
          ...cartItems,
          {
            id: `temp-${product.id}`,
            product_id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
            line_total: product.price,
            image: product.images?.[0] || null,
            slug: product.slug,
            in_stock: true
          }
        ]
      }
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.line_total, 0)
      return {
        ...oldData,
        items: updatedItems,
        subtotal: newSubtotal
      }
    })

    toast.success('Added to cart!')
    try {
      await cartAPI.add(product.id)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart')
      // Rollback Zustand
      const existing = useCartStore.getState().items.find(i => i.product_id === product.id)
      if (existing) {
        if (existing.quantity > 1) {
          const updated = useCartStore.getState().items.map(i =>
            i.product_id === product.id ? { ...i, quantity: i.quantity - 1 } : i
          )
          useCartStore.setState({ items: updated })
        } else {
          const updated = useCartStore.getState().items.filter(i => i.product_id !== product.id)
          useCartStore.setState({ items: updated, count: updated.length })
        }
      }
      // Rollback React Query Cache
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <Link to={`/shop/${product.slug}`} className="group block card hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-canvas-50">
        {product.images?.[0] ? (
          <img
            src={getOptimizedImageUrl(product.images[0], 600)}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-canvas-gradient">
            <span className="text-5xl opacity-30">🎨</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="badge bg-canvas-600 text-white">Featured</span>
          )}
          {discount && (
            <span className="badge bg-blush text-white">{discount}% OFF</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-600 text-white">Sold Out</span>
          )}
        </div>

        {/* Hover overlay (desktop only) */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-300 hidden md:flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary py-2 px-5 text-sm flex items-center gap-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-ink-muted font-medium uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-display font-semibold text-ink leading-snug mb-2 group-hover:text-canvas-700 transition-colors line-clamp-2">
          {product.title}
        </h3>
        {product.size && (
          <p className="text-xs text-ink-muted mb-2">{product.size} • {product.medium}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-canvas-700">₹{product.price.toLocaleString('en-IN')}</span>
            {product.original_price && (
              <span className="text-sm text-ink-muted line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-ink-muted">
            <Eye className="w-3 h-3" />
            <span>{product.views}</span>
          </div>
        </div>

        {/* Mobile Add to Cart Button */}
        <div className="mt-3 md:hidden">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
