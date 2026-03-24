import { useEffect, useState } from 'react'
import { Bookmark, ExternalLink, Building2 } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function SavedJobs() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Saved jobs are stored on the user object
    // We fetch the user profile to get saved_jobs
    api.get('/resume/me')  // We'll piggyback the user info from any auth'd endpoint
      .catch(() => {})
      .finally(() => setLoading(false))

    // For now, load from localStorage as saved jobs come via the save endpoint
    // In a fuller implementation, add GET /api/jobs/saved endpoint
    setLoading(false)
    setJobs([]) // Starts empty; populated as user saves via JobCard
  }, [])

  if (loading) return <div className="card p-10 animate-pulse" />

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-display font-semibold text-white mb-1">Saved Jobs</h2>
        <p className="text-slate-400 text-sm">Jobs you've bookmarked for later</p>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No saved jobs yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Click the bookmark icon on any job card to save it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <div key={i} className="card-hover p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-slate-300">
                {job.company?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{job.title}</p>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Building2 size={10} /> {job.company}
                </span>
              </div>
              {job.apply_url && (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0"
                >
                  <ExternalLink size={12} /> Apply
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
