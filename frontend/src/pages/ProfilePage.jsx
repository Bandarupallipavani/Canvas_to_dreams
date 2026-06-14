import { useState } from 'react'
import { User, Save } from 'lucide-react'
import { authAPI } from '../utils/api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  })

  const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.updateProfile(form)
      updateUser(form)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, field, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <input type={type} value={form[field]} onChange={update(field)}
        placeholder={placeholder} className="input" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-canvas-200 rounded-full flex items-center justify-center">
          <span className="font-bold text-canvas-700 text-lg">{user?.full_name?.[0]?.toUpperCase()}</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{user?.full_name}</h1>
          <p className="text-sm text-ink-muted">{user?.email}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-ink mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-canvas-600" /> Edit Profile
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" field="full_name" placeholder="Your full name" />
            <Field label="Phone" field="phone" placeholder="10-digit mobile" />
            <div className="sm:col-span-2">
              <Field label="Address" field="address" placeholder="House/Flat, Street, Area" />
            </div>
            <Field label="City" field="city" placeholder="Hyderabad" />
            <Field label="State" field="state" placeholder="Telangana" />
            <Field label="Pincode" field="pincode" placeholder="500001" />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
