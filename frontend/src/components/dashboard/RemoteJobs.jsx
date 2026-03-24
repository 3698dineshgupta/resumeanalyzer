import { useState, useEffect } from 'react'
import { Globe, Wifi } from 'lucide-react'
import JobList from '../jobs/JobList'
import JobFilters from '../jobs/JobFilters'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function RemoteJobs({ onApply }) {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRemote = async (extra = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/jobs/remote', { params: extra })
      setJobs(data)
    } catch {
      toast.error('Failed to load remote jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRemote() }, [])

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-display font-semibold text-white mb-1">Remote Jobs</h2>
        <p className="text-slate-400 text-sm">Work from anywhere — filtered and matched to your skills</p>
      </div>

      {/* Info banner */}
      <div className="card p-4 mb-5 flex items-start gap-3 border-brand-500/20">
        <div className="w-9 h-9 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Wifi size={16} className="text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">100% Remote Positions</p>
          <p className="text-xs text-slate-400 mt-0.5">
            These jobs support full remote work. Many include international salary bands.
          </p>
        </div>
      </div>

      <JobFilters onFilter={f => fetchRemote(f)} />
      <JobList
        jobs={jobs}
        loading={loading}
        onApply={onApply}
        emptyMessage="No remote jobs found. Try clearing filters."
      />
    </div>
  )
}
