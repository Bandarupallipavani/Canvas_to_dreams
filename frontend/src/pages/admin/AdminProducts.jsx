import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, EyeOff, X, ImagePlus } from 'lucide-react'
import { adminAPI } from '../../utils/api'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  title: '', description: '', price: '', original_price: '',
  category: '', medium: '', size: '', tags: '', stock: 1,
  is_featured: false, instagram_url: '', youtube_url: '', images: [],
}

const CATEGORIES = ['Abstract', 'Portrait', 'Landscape', 'Floral', 'Wildlife', 'Spiritual', 'Contemporary', 'Traditional', 'Other']
const MEDIUMS = ['Oil', 'Acrylic', 'Watercolor', 'Gouache', 'Mixed Media', 'Charcoal', 'Pastel', 'Digital']

// ── Moved OUTSIDE component so it never remounts on re-render ──
function FormField({ label, field, type = 'text', value, onChange, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="input"
        {...rest}
      />
    </div>
  )
}

export default function AdminProducts() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminAPI.listProducts().then(r => r.data),
  })

  // Stable handler — won't cause Field to remount
  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCheckbox = (e) => {
    setForm(prev => ({ ...prev, is_featured: e.target.checked }))
  }

  const handleSelect = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleTextarea = (e) => {
    setForm(prev => ({ ...prev, description: e.target.value }))
  }

  const openCreate = () => { setForm(EMPTY_FORM); setEditProduct(null); setShowForm(true) }
  const openEdit = (p) => {
    setForm({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      original_price: p.original_price || '',
    })
    setEditProduct(p)
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditProduct(null); setForm(EMPTY_FORM) }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const uploaded = []
    try {
      for (const file of files) {
        const { data } = await adminAPI.uploadImage(file)
        uploaded.push(data.url)
      }
      setForm(p => ({ ...p, images: [...(p.images || []), ...uploaded] }))
      toast.success(`${uploaded.length} image(s) uploaded`)
    } catch {
      toast.error('Image upload failed — check Cloudinary config')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx) => {
    setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (editProduct) {
        await adminAPI.updateProduct(editProduct.id, payload)
        toast.success('Painting updated!')
      } else {
        await adminAPI.createProduct(payload)
        toast.success('Painting added to gallery!')
      }
      qc.invalidateQueries(['admin-products'])
      qc.invalidateQueries(['products'])
      closeForm()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save painting')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (product) => {
    try {
      await adminAPI.toggleProduct(product.id)
      qc.invalidateQueries(['admin-products'])
      toast.success(product.is_available ? 'Painting hidden from shop' : 'Painting visible in shop')
    } catch { toast.error('Failed to toggle visibility') }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteProduct(product.id)
      qc.invalidateQueries(['admin-products'])
      toast.success('Painting deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Paintings</h1>
          <p className="text-ink-muted mt-1">{products.length} total paintings</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Painting
        </button>
      </div>

      {/* Product Table (Desktop only) */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas-50">
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Painting</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Category</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Price</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Stock</th>
                <th className="text-left px-5 py-3 text-ink-muted font-medium">Status</th>
                <th className="text-right px-5 py-3 text-ink-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-canvas-100 rounded w-20" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </td>
                  ))}</tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-ink-muted">
                  No paintings yet — add your first one!
                </td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-canvas-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-canvas-100 flex-shrink-0">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🎨</div>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-ink line-clamp-1">{p.title}</p>
                        {p.is_featured && <span className="badge bg-canvas-100 text-canvas-700 text-[10px]">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{p.category}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-canvas-700">₹{p.price?.toLocaleString('en-IN')}</span>
                    {p.original_price && (
                      <span className="text-ink-muted line-through ml-1 text-xs">₹{p.original_price?.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={p.stock === 0 ? 'text-blush font-medium' : 'text-ink'}>
                      {p.stock === 0 ? 'Sold Out' : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${p.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_available ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(p)} title={p.is_available ? 'Hide' : 'Show'}
                        className="p-1.5 hover:bg-canvas-100 rounded-lg transition-colors text-ink-muted">
                        {p.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-500">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-blush">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (shown only on mobile) */}
      <div className="space-y-4 md:hidden">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-canvas-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-canvas-100 rounded w-1/2" />
                  <div className="h-3 bg-canvas-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-10 bg-canvas-100 rounded-lg" />
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="card p-8 text-center text-ink-muted">
            No paintings yet — add your first one!
          </div>
        ) : (
          products.map(p => (
            <div key={p.id} className="card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-canvas-100 flex-shrink-0">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🎨</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-ink-muted">{p.category}</span>
                    {p.is_featured && (
                      <span className="badge bg-canvas-100 text-canvas-700 text-[9px] px-1.5 py-0">Featured</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-2 border-t border-b border-canvas-50">
                <div>
                  <p className="text-ink-muted">Price</p>
                  <p className="font-bold text-canvas-700 mt-0.5">₹{p.price?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Stock</p>
                  <p className={`font-semibold mt-0.5 ${p.stock === 0 ? 'text-blush' : 'text-ink'}`}>
                    {p.stock === 0 ? 'Sold Out' : p.stock}
                  </p>
                </div>
                <div>
                  <p className="text-ink-muted">Status</p>
                  <span className={`badge mt-0.5 text-[10px] px-2 py-0 ${p.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_available ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => handleToggle(p)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-canvas-50 text-ink-muted hover:bg-canvas-100 text-xs font-medium transition-colors"
                >
                  {p.is_available ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-blush hover:bg-red-100 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-over Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={closeForm} />
          <div className="w-full max-w-xl bg-white overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-canvas-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-display font-bold text-lg text-ink">
                {editProduct ? 'Edit Painting' : 'Add New Painting'}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-canvas-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images?.map((img, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blush text-white rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className={`w-20 h-20 border-2 border-dashed border-canvas-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-canvas-400 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ImagePlus className="w-5 h-5 text-canvas-400 mb-1" />
                    <span className="text-xs text-ink-muted">{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* All fields use stable FormField component */}
              <FormField label="Title *" field="title" value={form.title} onChange={handleFieldChange} required placeholder="e.g. Morning Serenity" />

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={handleTextarea}
                  required
                  rows={3}
                  placeholder="Describe the painting, its inspiration, mood..."
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Price (₹) *" field="price" type="number" value={form.price} onChange={handleFieldChange} required placeholder="2500" min="0" />
                <FormField label="Original Price (₹)" field="original_price" type="number" value={form.original_price} onChange={handleFieldChange} placeholder="3500" min="0" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Category *</label>
                  <select value={form.category} onChange={handleSelect('category')} required className="input">
                    <option value="">Select category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Medium</label>
                  <select value={form.medium} onChange={handleSelect('medium')} className="input">
                    <option value="">Select medium...</option>
                    {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Size" field="size" value={form.size} onChange={handleFieldChange} placeholder="e.g. 12×16 inches" />
                <FormField label="Stock" field="stock" type="number" value={form.stock} onChange={handleFieldChange} min="0" placeholder="1" />
              </div>

              <FormField label="Tags (comma separated)" field="tags" value={form.tags} onChange={handleFieldChange} placeholder="floral, blue, meditation" />
              <FormField label="Instagram URL" field="instagram_url" value={form.instagram_url} onChange={handleFieldChange} placeholder="https://instagram.com/p/..." />
              <FormField label="YouTube URL" field="youtube_url" value={form.youtube_url} onChange={handleFieldChange} placeholder="https://youtube.com/watch?v=..." />

              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={handleCheckbox}
                  className="w-4 h-4 accent-canvas-600 rounded"
                />
                <span className="text-sm font-medium text-ink">Featured painting (shows on homepage)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editProduct ? 'Update Painting' : 'Add Painting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
