import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../utils/api'
import { Users } from 'lucide-react'

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.listUsers().then(r => r.data),
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-2">
          <Users className="w-7 h-7 text-canvas-600" /> Users
        </h1>
        <p className="text-ink-muted mt-1">{users.length} registered users</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas-50">
                {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-ink-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-canvas-100 rounded animate-pulse w-24" />
                    </td>
                  ))}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-ink-muted">No users yet</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-canvas-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-canvas-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-canvas-700 font-bold text-xs">{u.full_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-ink">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{u.email}</td>
                  <td className="px-5 py-4 text-ink-muted">{u.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${u.role === 'admin' ? 'bg-canvas-100 text-canvas-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
