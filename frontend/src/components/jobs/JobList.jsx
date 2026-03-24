import { useState } from 'react'
import JobCard from './JobCard'
import { Briefcase } from 'lucide-react'

const PAGE_SIZE = 6

export default function JobList({ jobs, loading, emptyMessage, onApply }) {
  const [page, setPage] = useState(1)
  const total = jobs?.length || 0
  const pages = Math.ceil(total / PAGE_SIZE)
  const slice = jobs?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || []

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex gap-3 mb-4">
              <div className="w-11 h-11 bg-slate-800 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="h-5 bg-slate-800 rounded-full w-16" />
              <div className="h-5 bg-slate-800 rounded-full w-24" />
            </div>
            <div className="h-3 bg-slate-800 rounded w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!jobs?.length) {
    return (
      <div className="card p-12 text-center">
        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase size={24} className="text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">{emptyMessage || 'No jobs found'}</p>
        <p className="text-slate-600 text-sm mt-1">Try adjusting your filters or uploading a resume</p>
      </div>
    )
  }

  return (
    <div>
      {/* Count */}
      <p className="text-xs text-slate-500 mb-3">
        Showing {slice.length} of {total} jobs
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {slice.map(job => (
          <JobCard key={job.id} job={job} onApply={onApply} />
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === i + 1
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === pages}
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
