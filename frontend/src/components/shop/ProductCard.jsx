import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import { cartAPI } from '../../utils/api'
import { useCartStore, useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in to add to cart')
      navigate('/login')
      return
    }
    try {
      await cartAPI.add(product.id)
      addItem(product)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart')
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
            src={product.images[0]}
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

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
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
      </div>
    </Link>
  )
}
