import { useState } from 'react'
import { MapPin, Building2, ExternalLink, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Zap, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import clsx from 'clsx'

export default function JobCard({ job, onApply }) {
  const [expanded,  setExpanded]  = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [applying,  setApplying]  = useState(false)

  const score = job.match_score ?? -1
  const displayScore = score < 0 ? 'N/A' : `${score}%`

  const scoreColor =
    score < 0 ? 'text-slate-400 bg-slate-700/40 border-slate-600/30' :
    score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    score >= 60 ? 'text-brand-400 bg-brand-500/10 border-brand-500/20' :
    score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-slate-400 bg-slate-700/40 border-slate-600/30'

  const modeColor = {
    remote:  'badge-green',
    hybrid:  'badge-blue',
    onsite:  'badge-slate',
  }[job.work_mode?.toLowerCase()] || 'badge-slate'

  const applyNow = async () => {
    setApplying(true)
    try {
      await api.post('/jobs/apply', { job_id: job.id, job })
      if (job.apply_url) window.open(job.apply_url, '_blank', 'noopener')
      toast.success('Application recorded! Opening job page…')
      onApply?.(job)
    } catch {
      toast.error('Failed to record application')
    } finally {
      setApplying(false)
    }
  }

  const toggleSave = async () => {
    try {
      const { data } = await api.post('/jobs/save', { job_id: job.id, job })
      setSaved(data.saved)
      toast.success(data.saved ? 'Job saved!' : 'Job removed from saved')
    } catch {
      toast.error('Could not save job')
    }
  }

  return (
    <div className="card-hover p-5 flex flex-col gap-4 animate-fade-in">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        {/* Company logo placeholder */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold text-slate-300">
            {job.company?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-white text-base leading-tight">{job.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 size={12} className="text-slate-500" />
              <span className="text-sm text-slate-400">{job.company}</span>
            </div>
          </div>
        </div>

        {/* Match score badge */}
        <div className={clsx('flex-shrink-0 flex flex-col items-center border rounded-xl px-3 py-1.5', scoreColor)}>
          <span className="text-lg font-display font-bold leading-none">{displayScore}</span>
          <span className="text-[10px] font-medium opacity-80">match</span>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2">
        <span className={modeColor}>{job.work_mode || 'Onsite'}</span>
        {job.location && (
          <span className="badge-slate">
            <MapPin size={9} /> {job.location}
          </span>
        )}
        {job.salary && (
          <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20">
            💰 {job.salary}
          </span>
        )}
        {job.category && (
          <span className="badge-amber">{job.category}</span>
        )}
      </div>

      {/* Matched skills */}
      {job.matched_skills?.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
            <Zap size={10} className="text-emerald-400" /> Matched skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.matched_skills.slice(0, 6).map(s => (
              <span key={s} className="badge-green text-xs capitalize">{s}</span>
            ))}
            {job.matched_skills.length > 6 && (
              <span className="badge-slate text-xs">+{job.matched_skills.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {/* Expandable section */}
      {expanded && (
        <div className="space-y-3 animate-fade-in border-t border-slate-800 pt-3">
          {/* Description */}
          {job.description && (
            <p className="text-sm text-slate-400 leading-relaxed">{job.description}</p>
          )}

          {/* Missing skills */}
          {job.missing_skills?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <AlertCircle size={10} className="text-rose-400" /> Skills to develop
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.missing_skills.slice(0, 8).map(s => (
                  <span key={s} className="badge bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs capitalize">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* All required skills */}
          {job.required_skills?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">All required skills</p>
              <div className="flex flex-wrap gap-1.5">
                {job.required_skills.map(s => (
                  <span key={s} className="badge-slate text-xs capitalize">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
        <button
          onClick={applyNow}
          disabled={applying}
          className="btn-primary flex-1 justify-center py-2 text-sm"
        >
          {applying ? 'Recording…' : 'Apply Now'}
          <ExternalLink size={13} />
        </button>

        <button
          onClick={() => setExpanded(s => !s)}
          className="btn-secondary py-2 px-3 text-sm"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {expanded ? 'Less' : 'Details'}
        </button>

        <button
          onClick={toggleSave}
          className={clsx(
            'p-2 rounded-xl border transition-all',
            saved
              ? 'bg-brand-500/15 border-brand-500/30 text-brand-400'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
          )}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
    </div>
  )
}
