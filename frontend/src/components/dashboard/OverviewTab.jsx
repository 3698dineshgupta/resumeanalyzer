import { Link } from 'react-router-dom'
import { Upload, Briefcase, MapPin, Globe, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'
import ATSScoreCard from './ATSScoreCard'
import ResumeSummary from './ResumeSummary'

export default function OverviewTab({ resume, jobs, onTabChange }) {
  const parsed   = resume?.parsed
  const analysis = resume?.analysis
  const topJobs  = (jobs || []).slice(0, 3)

  const stats = [
    { label: 'ATS Score',     value: analysis ? `${analysis.ats_score}/100` : '—', icon: TrendingUp, color: 'text-brand-400',   bg: 'bg-brand-500/10' },
    { label: 'Skills Found',  value: parsed?.skills?.length ?? 0,                  icon: CheckCircle2,color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
    { label: 'Matched Jobs',  value: jobs?.length ?? 0,                             icon: Briefcase,  color: 'text-amber-400',  bg: 'bg-amber-500/10' },
    { label: 'Skill Gaps',    value: analysis?.missing_skills?.length ?? 0,         icon: MapPin,     color: 'text-rose-400',   bg: 'bg-rose-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-white mb-1">Dashboard Overview</h2>
        <p className="text-slate-400 text-sm">Your career snapshot at a glance</p>
      </div>

      {/* Quick upload CTA if no resume */}
      {!parsed && (
        <div className="card p-6 border-dashed border-brand-500/30 text-center">
          <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Upload size={24} className="text-brand-400" />
          </div>
          <h3 className="font-display font-semibold text-white text-lg mb-1">Upload your resume to get started</h3>
          <p className="text-slate-400 text-sm mb-4">Get ATS score, job matches, and skill gap analysis in seconds</p>
          <Link to="/upload" className="btn-primary inline-flex">
            <Upload size={16} /> Upload Resume
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={17} className={color} />
            </div>
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout on larger screens */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* ATS Score card */}
        {analysis && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">ATS Score</h3>
              <button onClick={() => onTabChange('analysis')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Full Analysis <ArrowRight size={11} />
              </button>
            </div>
            <ATSScoreCard analysis={analysis} />
          </div>
        )}

        {/* Resume summary snapshot */}
        {parsed && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">Resume Summary</h3>
              <Link to="/upload" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Re-upload <ArrowRight size={11} />
              </Link>
            </div>
            <ResumeSummary
              parsed={parsed}
              filename={resume?.filename}
              uploadedAt={resume?.uploaded_at}
            />
          </div>
        )}
      </div>

      {/* Top job matches preview */}
      {topJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm">Top Job Matches</h3>
            <button onClick={() => onTabChange('recommended')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              See all <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-3">
            {topJobs.map(job => (
              <div key={job.id} className="card-hover p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-slate-300">
                  {job.company?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{job.title}</p>
                  <p className="text-xs text-slate-400 truncate">{job.company} · {job.location}</p>
                </div>
                <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold border ${
                  job.match_score >= 70
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : job.match_score >= 40
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                      : 'bg-slate-700/40 text-slate-400 border-slate-600/30'
                }`}>
                  {job.match_score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Browse Recommended Jobs', tab: 'recommended', icon: Briefcase, color: 'text-brand-400' },
          { label: 'Find Remote Work',         tab: 'remote',      icon: Globe,     color: 'text-emerald-400' },
          { label: 'Jobs Near Me',             tab: 'nearby',      icon: MapPin,    color: 'text-amber-400' },
        ].map(({ label, tab, icon: Icon, color }) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="card-hover p-4 flex items-center gap-3 text-left group"
          >
            <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700 transition-all">
              <Icon size={16} className={color} />
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
            <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
