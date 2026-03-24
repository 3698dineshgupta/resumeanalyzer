import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import api from '../services/api'

import Sidebar          from '../components/dashboard/Sidebar'
import OverviewTab      from '../components/dashboard/OverviewTab'
import RecommendedJobs  from '../components/dashboard/RecommendedJobs'
import NearbyJobs       from '../components/dashboard/NearbyJobs'
import RemoteJobs       from '../components/dashboard/RemoteJobs'
import AppliedJobs      from '../components/dashboard/AppliedJobs'
import SavedJobs        from '../components/dashboard/SavedJobs'
import ATSScoreCard     from '../components/dashboard/ATSScoreCard'
import ResumeSummary    from '../components/dashboard/ResumeSummary'
import SkillAnalysis    from '../components/dashboard/SkillAnalysis'
import AssistantPanel   from '../components/dashboard/AssistantPanel'

export default function DashboardPage() {
  const [activeTab,  setActiveTab]  = useState('overview')
  const [resume,     setResume]     = useState(null)
  const [jobs,       setJobs]       = useState([])
  const [resumeLoad, setResumeLoad] = useState(true)
  const [jobsLoad,   setJobsLoad]   = useState(true)

  // ── Load resume ─────────────────────────────────────────────────────────────
  const loadResume = useCallback(async () => {
    setResumeLoad(true)
    try {
      const { data } = await api.get('/resume/me')
      setResume(data)
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Failed to load resume')
    } finally {
      setResumeLoad(false)
    }
  }, [])

  // ── Load recommended jobs ───────────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setJobsLoad(true)
    try {
      const { data } = await api.get('/jobs/recommended')
      setJobs(data)
    } catch {
      // Silently fail – shown in tab-level error states
    } finally {
      setJobsLoad(false)
    }
  }, [])

  useEffect(() => {
    loadResume()
    loadJobs()
  }, [loadResume, loadJobs])

  // ── Track a new application in local state ──────────────────────────────────
  const handleApply = (job) => {
    // Optimistic UI; actual recording is done inside JobCard
  }

  // ── Tab renderer ─────────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            resume={resume}
            jobs={jobs}
            onTabChange={setActiveTab}
          />
        )

      case 'recommended':
        return <RecommendedJobs onApply={handleApply} />

      case 'nearby':
        return <NearbyJobs onApply={handleApply} />

      case 'remote':
        return <RemoteJobs onApply={handleApply} />

      case 'applied':
        return <AppliedJobs />

      case 'saved':
        return <SavedJobs />

      case 'analysis':
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-1">Skill Analysis</h2>
              <p className="text-slate-400 text-sm">Deep-dive into your strengths and gaps</p>
            </div>
            {resumeLoad ? (
              <div className="card p-10 animate-pulse" />
            ) : resume ? (
              <>
                <ATSScoreCard analysis={resume.analysis} />
                <SkillAnalysis parsed={resume.parsed} analysis={resume.analysis} />
              </>
            ) : (
              <ResumeSummary parsed={null} />
            )}
          </div>
        )

      case 'resume':
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-1">My Resume</h2>
              <p className="text-slate-400 text-sm">Parsed data extracted from your uploaded resume</p>
            </div>
            {resumeLoad ? (
              <div className="card p-10 animate-pulse" />
            ) : (
              <ResumeSummary
                parsed={resume?.parsed}
                filename={resume?.filename}
                uploadedAt={resume?.uploaded_at}
              />
            )}
          </div>
        )

      case 'assistant':
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-1">AI Assistant</h2>
              <p className="text-slate-400 text-sm">Ask anything about your career, resume, or jobs</p>
            </div>
            <AssistantPanel />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          {/* Loading skeleton */}
          {resumeLoad && activeTab === 'overview' ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-slate-800 rounded-xl w-48" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-800 rounded-2xl" />
                ))}
              </div>
              <div className="h-64 bg-slate-800 rounded-2xl" />
            </div>
          ) : (
            <div className="animate-slide-up">
              {renderTab()}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
