import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, ArrowLeft, Instagram, Youtube, ZoomIn, Share2, CheckCircle } from 'lucide-react'
import { productsAPI, cartAPI } from '../utils/api'
import { useCartStore, useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(0)
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsAPI.get(slug).then(r => r.data),
  })

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to cart')
      navigate('/login')
      return
    }
    // Optimistic Update
    addItem(product)
    toast.success('Added to cart!')
    try {
      await cartAPI.add(product.id)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add')
      // Rollback
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
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await handleAddToCart()
    navigate('/checkout')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-canvas-100 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-canvas-100 rounded animate-pulse" />)}
        </div>
      </div>
    </div>
  )

  if (isError || !product) return (
    <div className="text-center py-20">
      <p className="text-xl font-display">Painting not found</p>
      <Link to="/shop" className="btn-primary mt-4 inline-block">Back to Gallery</Link>
    </div>
  )

  const images = product.images?.length > 0 ? product.images : [null]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-8">
        <Link to="/" className="hover:text-canvas-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-canvas-600">Gallery</Link>
        <span>/</span>
        <span className="text-ink truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-canvas-50 group">
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-20">🎨</span>
              </div>
            )}
            <button
              className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open(images[activeImage], '_blank')}
            >
              <ZoomIn className="w-4 h-4 text-ink" />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === i ? 'border-canvas-500' : 'border-transparent'
                  }`}
                >
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-canvas-100 flex items-center justify-center">
                      <span className="text-xl">🎨</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className="badge bg-canvas-100 text-canvas-700">{product.category}</span>
            <button onClick={handleShare} className="p-2 hover:bg-canvas-50 rounded-lg transition-colors">
              <Share2 className="w-4 h-4 text-ink-muted" />
            </button>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-canvas-700">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.original_price && (
              <>
                <span className="text-lg text-ink-muted line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
                <span className="badge bg-blush/10 text-blush font-semibold">
                  {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Specs */}
          {(product.medium || product.size) && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.medium && (
                <div className="bg-canvas-50 rounded-lg p-3">
                  <p className="text-xs text-ink-muted font-medium">Medium</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">{product.medium}</p>
                </div>
              )}
              {product.size && (
                <div className="bg-canvas-50 rounded-lg p-3">
                  <p className="text-xs text-ink-muted font-medium">Size</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">{product.size}</p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-ink mb-2">About this Painting</h3>
            <p className="text-ink-muted leading-relaxed text-sm">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags.map(t => (
                <span key={t} className="badge bg-canvas-50 text-ink-muted border border-canvas-100">#{t}</span>
              ))}
            </div>
          )}

          {/* Trust points */}
          <div className="space-y-2 mb-8">
            {['Original handcrafted painting — not a print', 'Carefully packed and insured shipping', 'Certificate of authenticity included'].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-ink-muted">
                <CheckCircle className="w-4 h-4 text-sage flex-shrink-0" />
                {p}
              </div>
            ))}
          </div>

          {/* Stock */}
          <div className="mb-4">
            {product.stock > 0 ? (
              <span className="text-sage font-medium text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-sage rounded-full inline-block" />
                {product.stock === 1 ? 'Only 1 left — unique piece!' : `${product.stock} available`}
              </span>
            ) : (
              <span className="text-blush font-medium text-sm">● Sold Out</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-outline flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>

          {/* Social links */}
          {(product.instagram_url || product.youtube_url) && (
            <div className="flex gap-3 mt-4">
              {product.instagram_url && (
                <a href={product.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-canvas-600 transition-colors">
                  <Instagram className="w-4 h-4" /> View on Instagram
                </a>
              )}
              {product.youtube_url && (
                <a href={product.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-red-600 transition-colors">
                  <Youtube className="w-4 h-4" /> Watch on YouTube
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
