import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Truck, IndianRupee, Lock } from 'lucide-react'
import { cartAPI, ordersAPI } from '../utils/api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

// ── Stable field component defined OUTSIDE to prevent remount ──
function CheckoutField({ label, field, type = 'text', value, onChange, required = true, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        required={required}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
      />
    </div>
  )
}

export default function CheckoutPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    shipping_name: user?.full_name || '',
    shipping_email: user?.email || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_state: user?.state || '',
    shipping_pincode: user?.pincode || '',
    notes: '',
  })

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.get().then(r => r.data),
  })

  // Stable handler won't cause fields to remount
  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleNotes = (e) => setForm(prev => ({ ...prev, notes: e.target.value }))

  const subtotal = cartData?.subtotal || 0
  const shipping = subtotal >= 2000 ? 0 : 150
  const total = subtotal + shipping

  const handleCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await ordersAPI.checkout({ ...form, payment_method: paymentMethod })

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!')
        navigate(`/order-success/${data.order_id}`)
        return
      }

      if (paymentMethod === 'razorpay' && data.razorpay_order_id) {
        if (!window.Razorpay) {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          document.body.appendChild(script)
          await new Promise(resolve => script.onload = resolve)
        }
        const options = {
          key: RAZORPAY_KEY || data.razorpay_key,
          amount: Math.round(total * 100),
          currency: 'INR',
          name: 'Canvas to Dreams',
          description: 'Original Paintings Purchase',
          order_id: data.razorpay_order_id,
          prefill: {
            name: form.shipping_name,
            email: form.shipping_email,
            contact: form.shipping_phone,
          },
          theme: { color: '#b86e1f' },
          handler: async (response) => {
            try {
              await ordersAPI.verifyPayment({
                order_id: data.order_id,
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              toast.success('Payment successful! 🎉')
              navigate(`/order-success/${data.order_id}`)
            } catch {
              toast.error('Payment verification failed. Please contact support.')
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
        return
      }

      if (paymentMethod === 'stripe' && data.stripe_client_secret) {
        toast.success('Stripe payment initiated')
      }

    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Checkout</h1>

      <form onSubmit={handleCheckout}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Details */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-ink mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-canvas-600" /> Shipping Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CheckoutField label="Full Name" field="shipping_name" value={form.shipping_name} onChange={handleChange} placeholder="Your full name" />
                <CheckoutField label="Email" field="shipping_email" type="email" value={form.shipping_email} onChange={handleChange} placeholder="your@email.com" />
                <CheckoutField label="Phone" field="shipping_phone" value={form.shipping_phone} onChange={handleChange} placeholder="10-digit mobile number" />
                <CheckoutField label="Pincode" field="shipping_pincode" value={form.shipping_pincode} onChange={handleChange} placeholder="560001" />
                <div className="sm:col-span-2">
                  <CheckoutField label="Address" field="shipping_address" value={form.shipping_address} onChange={handleChange} placeholder="House/Flat No, Street, Area" />
                </div>
                <CheckoutField label="City" field="shipping_city" value={form.shipping_city} onChange={handleChange} placeholder="Hyderabad" />
                <CheckoutField label="State" field="shipping_state" value={form.shipping_state} onChange={handleChange} placeholder="Telangana" />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-ink mb-1">Special Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={handleNotes}
                    rows={2}
                    className="input resize-none"
                    placeholder="Any special instructions for packaging or delivery..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-canvas-600" /> Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'razorpay', label: 'Pay Online — Razorpay', desc: 'UPI, Credit/Debit Card, Net Banking, Wallets (India)', icon: '💳' },
                  { id: 'stripe',   label: 'Pay Online — Stripe',   desc: 'International cards (Visa, Mastercard, Amex)',             icon: '🌐' },
                  { id: 'cod',      label: 'Cash on Delivery',       desc: 'Pay when your painting arrives at your door',              icon: '💰' },
                ].map(opt => (
                  <label key={opt.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === opt.id ? 'border-canvas-500 bg-canvas-50' : 'border-canvas-100 hover:border-canvas-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="mt-0.5 accent-canvas-600"
                    />
                    <div>
                      <div className="font-medium text-ink text-sm">{opt.icon} {opt.label}</div>
                      <div className="text-xs text-ink-muted mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-ink-muted">
                <Lock className="w-3 h-3" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg text-ink mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cartData?.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <div className="w-10 h-10 bg-canvas-50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-base">🎨</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{item.title}</p>
                      <p className="text-ink-muted text-xs">× {item.quantity}</p>
                    </div>
                    <p className="font-medium text-ink whitespace-nowrap">₹{item.line_total?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <hr className="border-canvas-100 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-sage font-medium' : ''}>
                    {shipping === 0 ? 'FREE 🎉' : `₹${shipping}`}
                  </span>
                </div>
                <hr className="border-canvas-100" />
                <div className="flex justify-between font-bold text-ink text-base">
                  <span>Total</span>
                  <span className="text-canvas-700">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !cartData?.items?.length}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  : <><IndianRupee className="w-4 h-4" /> Place Order</>
                }
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
