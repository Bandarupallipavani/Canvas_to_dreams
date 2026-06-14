import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productsAPI } from '../utils/api'
import ProductCard from '../components/shop/ProductCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Viewed' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsAPI.categories().then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, category, sort],
    queryFn: () => productsAPI.list({
      page, limit: 12, search: search || undefined,
      category: category || undefined, sort,
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const clearFilters = () => {
    setSearch(''); setCategory(''); setSort('newest'); setPage(1)
  }

  const hasFilters = search || category || sort !== 'newest'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-ink mb-2">Gallery</h1>
        <p className="text-ink-muted">
          {data?.total ? `${data.total} original paintings` : 'Discover original paintings'}
        </p>
      </div>

      {/* Search + Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search paintings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </form>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1) }}
            className="input w-auto"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline flex items-center gap-2 py-2.5 px-4 ${showFilters ? 'bg-canvas-600 text-white border-canvas-600' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:block">Filters</span>
          </button>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost flex items-center gap-1 text-blush">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      {showFilters && catData && (
        <div className="bg-white border border-canvas-100 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-ink mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCategory(''); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                !category ? 'bg-canvas-600 text-white border-canvas-600' : 'border-canvas-200 text-ink-muted hover:border-canvas-400'
              }`}
            >
              All ({data?.total || 0})
            </button>
            {catData.map(c => (
              <button
                key={c.name}
                onClick={() => { setCategory(c.name); setPage(1) }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  category === c.name ? 'bg-canvas-600 text-white border-canvas-600' : 'border-canvas-200 text-ink-muted hover:border-canvas-400'
                }`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/5] bg-canvas-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-canvas-100 rounded w-1/3" />
                <div className="h-4 bg-canvas-100 rounded w-3/4" />
                <div className="h-4 bg-canvas-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.products?.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl">🎨</span>
          <p className="font-display text-xl text-ink mt-4">No paintings found</p>
          <p className="text-ink-muted mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Browse All</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {data?.products?.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline py-2 px-4 disabled:opacity-40"
          >
            Previous
          </button>
          {[...Array(data.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                page === i + 1 ? 'bg-canvas-600 text-white' : 'hover:bg-canvas-50 text-ink'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="btn-outline py-2 px-4 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
