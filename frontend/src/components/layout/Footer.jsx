import { Link } from 'react-router-dom'
import { Palette, Instagram, Youtube, Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ink text-parchment-dark mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-canvas-500 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg">Canvas to Dreams</span>
            </div>
            <p className="text-sm text-canvas-200 leading-relaxed">
              Every painting is a journey from a blank canvas to a living dream. 
              Original handcrafted art, made with love.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.instagram.com/canvas_to_dreams"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-ink-light hover:bg-canvas-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@canvas_to_dreams"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-ink-light hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@canvastodreams.in"
                className="w-9 h-9 bg-ink-light hover:bg-canvas-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-parchment mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-canvas-200">
              {[
                { to: '/shop', label: 'Browse Paintings' },
                { to: '/about', label: 'About the Artist' },
                { to: '/my-orders', label: 'Track Order' },
                { to: '/profile', label: 'My Account' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-canvas-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display font-semibold text-parchment mb-4">Shop Info</h3>
            <ul className="space-y-2 text-sm text-canvas-200">
              <li>🎨 100% Original Paintings</li>
              <li>🚚 Free shipping on orders above ₹2000</li>
              <li>📦 Carefully packaged & insured</li>
              <li>↩️ Easy returns within 7 days</li>
              <li>💳 Razorpay & Stripe secure payments</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-light mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} Canvas to Dreams. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-blush fill-blush" /> by the artist
          </p>
        </div>
      </div>
    </footer>
  )
}
