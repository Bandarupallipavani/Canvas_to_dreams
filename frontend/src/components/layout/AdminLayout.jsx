import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Palette, ArrowLeft, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Paintings', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between bg-ink text-parchment h-16 px-4 fixed top-0 left-0 right-0 z-30 border-b border-ink-light">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-ink-light"
        >
          <Menu className="w-5 h-5 text-parchment" />
        </button>
        <div className="font-display font-bold text-sm tracking-wide">Admin Panel</div>
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Sidebar Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-60 bg-ink text-parchment flex flex-col fixed h-full z-50 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-5 border-b border-ink-light flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-canvas-500 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sm">Canvas to Dreams</div>
              <div className="text-xs text-canvas-300">Admin Panel</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-ink-light text-canvas-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-canvas-600 text-white'
                    : 'text-canvas-200 hover:bg-ink-light hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-ink-light space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-canvas-200 hover:bg-ink-light hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blush hover:bg-red-900/30 transition-all w-full"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-60 min-h-screen pt-16 md:pt-0">
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
