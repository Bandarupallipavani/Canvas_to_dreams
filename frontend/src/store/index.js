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

      setCart: (items) => set({ items, count: items.length }),
      addItem: (item) => {
        const existing = get().items.find(i => i.product_id === item.product_id)
        if (existing) {
          const updated = get().items.map(i =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
          set({ items: updated, count: updated.length })
        } else {
          const updated = [...get().items, { ...item, quantity: 1 }]
          set({ items: updated, count: updated.length })
        }
      },
      removeItem: (id) => {
        const updated = get().items.filter(i => i.id !== id)
        set({ items: updated, count: updated.length })
      },
      clearCart: () => set({ items: [], count: 0 }),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'ctd-cart' }
  )
)
