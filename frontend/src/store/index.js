import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Auth Store ────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (data) => set({ user: { ...get().user, ...data } }),
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'ctd-auth' }
  )
)

// ── Cart Store (local, syncs with server) ─────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      count: 0,

      setCart: (items) => set({ items, count: items.reduce((sum, i) => sum + i.quantity, 0) }),
      addItem: (item) => {
        const targetProductId = item.product_id || item.id
        const existing = get().items.find(i => (i.product_id || i.id) === targetProductId)
        let updated
        if (existing) {
          updated = get().items.map(i =>
            (i.product_id || i.id) === targetProductId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        } else {
          updated = [...get().items, { ...item, product_id: targetProductId, quantity: 1 }]
        }
        set({ items: updated, count: updated.reduce((sum, i) => sum + i.quantity, 0) })
      },
      removeItem: (id) => {
        const updated = get().items.filter(i => i.id !== id)
        set({ items: updated, count: updated.reduce((sum, i) => sum + i.quantity, 0) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          const updated = get().items.filter(i => i.id !== id)
          set({ items: updated, count: updated.reduce((sum, i) => sum + i.quantity, 0) })
        } else {
          const updated = get().items.map(i =>
            i.id === id ? { ...i, quantity, line_total: i.price * quantity } : i
          )
          set({ items: updated, count: updated.reduce((sum, i) => sum + i.quantity, 0) })
        }
      },
      clearCart: () => set({ items: [], count: 0 }),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'ctd-cart' }
  )
)
