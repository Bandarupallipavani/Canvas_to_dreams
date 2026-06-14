import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, Palette, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore, useCartStore } from '../../store'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore()
  const { count } = useCartStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    setUserMenu(false)
    toast.success('Logged out!')
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-canvas-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-canvas-gradient rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Palette className="w-5 h-5 text-canvas-700" />
            </div>
            <div>
              <div className="font-display font-bold text-ink text-lg leading-none">Canvas to Dreams</div>
              <div className="text-xs text-ink-muted font-body leading-none">Original Paintings</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  pathname === l.to
                    ? 'bg-canvas-100 text-canvas-700'
                    : 'text-ink-muted hover:text-ink hover:bg-canvas-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-canvas-50 transition-colors">
              <ShoppingBag className="w-5 h-5 text-ink" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-canvas-600 text-parchment text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-canvas-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-canvas-200 rounded-full flex items-center justify-center">
                    <span className="text-canvas-700 font-bold text-xs">
                      {user?.full_name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-ink max-w-[100px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </button>

                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-canvas-100 py-1 z-50">
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-canvas-700 hover:bg-canvas-50 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-canvas-50"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-canvas-50"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>
                    <hr className="my-1 border-canvas-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blush hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-4 text-sm hidden md:block">
                Sign In
              </Link>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg hover:bg-canvas-50"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="md:hidden border-t border-canvas-100 py-3 space-y-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-ink hover:bg-canvas-50 font-medium"
              >
                {l.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-canvas-700 font-medium bg-canvas-50"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Close user menu on outside click */}
      {userMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
      )}
    </nav>
  )
}
