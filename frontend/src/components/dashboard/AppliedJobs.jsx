import { useEffect, useState } from 'react'
import { CheckSquare, ExternalLink, Calendar, Building2 } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function AppliedJobs() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jobs/applied')
      .then(r => setJobs(r.data))
      .catch(() => toast.error('Failed to load applied jobs'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse flex gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-1/2" />
              <div className="h-3 bg-slate-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-display font-semibold text-white mb-1">Applied Jobs</h2>
        <p className="text-slate-400 text-sm">Track all positions you've applied to</p>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No applications yet</p>
          <p className="text-slate-600 text-sm mt-1">Click "Apply Now" on any job card to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Stats bar */}
          <div className="card p-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-brand-400">{jobs.length}</p>
              <p className="text-xs text-slate-500">Total Applied</p>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <p className="text-sm text-slate-400">
              Keep applying! Most roles require 20–50 applications. Track your progress here.
            </p>
          </div>

          {/* Applied job cards */}
          {jobs.map((job, i) => (
            <div key={i} className="card-hover p-4 flex items-center gap-4">
              {/* Number */}
              <div className="w-9 h-9 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-brand-400 text-sm font-bold">{i + 1}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{job.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Building2 size={10} /> {job.company}
                  </span>
                  {job.location && (
                    <span className="text-xs text-slate-500">{job.location}</span>
                  )}
                </div>
              </div>

              {/* Date */}
              {job.applied_at && (
                <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                  <Calendar size={10} />
                  {new Date(job.applied_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              )}

              {/* Link */}
              {job.apply_url && (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0"
                >
                  <ExternalLink size={12} /> View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
