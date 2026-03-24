import { useState, useEffect } from 'react'
import { Briefcase } from 'lucide-react'
import JobList from '../jobs/JobList'
import JobFilters from '../jobs/JobFilters'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function RecommendedJobs({ onApply }) {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/jobs/recommended', { params })
      setJobs(data)
    } catch {
      toast.error('Failed to load recommended jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-display font-semibold text-white mb-1">Recommended Jobs</h2>
        <p className="text-slate-400 text-sm">Jobs ranked by how well they match your resume skills</p>
      </div>
      <JobFilters onFilter={f => fetchJobs(f)} />
      <JobList
        jobs={jobs}
        loading={loading}
        onApply={onApply}
        emptyMessage="No jobs found. Upload your resume to get personalized matches."
      />
    </div>
  )
}
