import { TrendingUp, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'

function ScoreRing({ score }) {
  const r    = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#0ea5e9' :
    score >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      {/* Track */}
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
      {/* Progress */}
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
    </svg>
  )
}

export default function ATSScoreCard({ analysis }) {
  if (!analysis) return null

  const { ats_score, suggestions, missing_skills, sections_found, profile_summary } = analysis
  const score = ats_score ?? 0

  const grade =
    score >= 80 ? { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' } :
    score >= 60 ? { label: 'Good',      color: 'text-brand-400',   bg: 'bg-brand-500/10 border-brand-500/20' } :
    score >= 40 ? { label: 'Fair',      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' } :
                  { label: 'Needs Work',color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' }

  return (
    <div className="space-y-4">
      {/* Score ring + summary */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Ring */}
          <div className="relative flex-shrink-0">
            <ScoreRing score={score} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-white">{score}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <TrendingUp size={16} className="text-slate-400" />
              <h3 className="text-lg font-display font-semibold text-white">ATS Score</h3>
              <span className={`badge border ${grade.bg} ${grade.color}`}>{grade.label}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{profile_summary}</p>

            {/* Sections found */}
            {sections_found?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {sections_found.map(s => (
                  <span key={s} className="badge-green capitalize">
                    <CheckCircle2 size={10} /> {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-400" />
            <h4 className="font-semibold text-white text-sm">Improvement Suggestions</h4>
          </div>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="w-5 h-5 bg-amber-500/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing important skills */}
      {missing_skills?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-rose-400" />
            <h4 className="font-semibold text-white text-sm">Missing Key Skills</h4>
            <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/20 ml-auto">
              {missing_skills.length} gaps
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missing_skills.map(s => (
              <span key={s} className="badge bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1">
                + {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
