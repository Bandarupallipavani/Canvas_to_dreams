import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Truck, Shield, RefreshCw, Instagram, Youtube } from 'lucide-react'
import { productsAPI } from '../utils/api'
import ProductCard from '../components/shop/ProductCard'

export default function HomePage() {
  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.list({ featured: true, limit: 4 }).then(r => r.data),
  })
  const { data: newData } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => productsAPI.list({ limit: 8, sort: 'newest' }).then(r => r.data),
  })

  const features = [
    { icon: Sparkles, title: '100% Original', desc: 'Every piece is one-of-a-kind, handcrafted with passion' },
    { icon: Truck, title: 'Free Shipping', desc: 'Free delivery on all orders above ₹2,000' },
    { icon: Shield, title: 'Secure Payment', desc: 'Razorpay & Stripe — your transactions are safe' },
    { icon: RefreshCw, title: '7-Day Returns', desc: 'Not in love? Return it hassle-free' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-canvas-gradient">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4892a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-canvas-100 text-canvas-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Handcrafted Original Paintings
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink leading-tight mb-6">
              Where Canvas
              <br />
              <span className="text-canvas-600 italic">Meets Dreams</span>
            </h1>
            <p className="text-lg text-ink-muted leading-relaxed mb-8 max-w-lg">
              Discover original paintings that transform your space. Each artwork is a 
              unique story painted with soul — from vibrant abstracts to serene landscapes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary text-base flex items-center gap-2">
                Explore Gallery <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://www.instagram.com/canvas_to_dreams"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-base flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" /> Follow on Instagram
              </a>
            </div>

            <div className="flex items-center gap-6 mt-10">
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-ink">50+</div>
                <div className="text-xs text-ink-muted">Paintings Sold</div>
              </div>
              <div className="w-px h-10 bg-canvas-200" />
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-ink">100%</div>
                <div className="text-xs text-ink-muted">Original Art</div>
              </div>
              <div className="w-px h-10 bg-canvas-200" />
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-ink">⭐ 5.0</div>
                <div className="text-xs text-ink-muted">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative brush stroke */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block">
          <div className="absolute inset-0 bg-canvas-gradient opacity-60 rounded-l-[80px]" />
          <div className="absolute inset-8 flex items-center justify-center">
            <span className="text-[200px] opacity-20">🎨</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white border-y border-canvas-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-canvas-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-canvas-600" />
                </div>
                <div>
                  <div className="font-semibold text-ink text-sm">{title}</div>
                  <div className="text-xs text-ink-muted mt-0.5 leading-snug">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Paintings */}
      {featuredData?.products?.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-canvas-600 font-medium text-sm mb-1">✦ Curated Collection</p>
              <h2 className="font-display text-3xl font-bold text-ink">Featured Paintings</h2>
            </div>
            <Link to="/shop?featured=true" className="btn-ghost text-sm flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredData.products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newData?.products?.length > 0 && (
        <section className="py-16 bg-canvas-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-canvas-600 font-medium text-sm mb-1">✦ Fresh Off the Easel</p>
                <h2 className="font-display text-3xl font-bold text-ink">New Arrivals</h2>
              </div>
              <Link to="/shop" className="btn-ghost text-sm flex items-center gap-1">
                Shop all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {newData.products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Social CTA */}
      <section className="py-16 bg-ink text-parchment">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-3">Follow the Journey</h2>
          <p className="text-canvas-200 mb-8">
            Watch paintings come to life on Instagram and YouTube. Behind-the-scenes, time-lapses, and new drops every week.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/canvas_to_dreams"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-5 h-5" /> @canvas_to_dreams
            </a>
            <a
              href="https://www.youtube.com/@canvas_to_dreams"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Youtube className="w-5 h-5" /> YouTube Channel
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
