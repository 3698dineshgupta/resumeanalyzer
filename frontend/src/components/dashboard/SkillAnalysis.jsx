import { BarChart2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

const TOP_SKILLS_BY_ROLE = {
  'Backend':   ['python','java','node.js','sql','docker','aws','redis','postgresql'],
  'Frontend':  ['react','typescript','css','html','webpack','figma','graphql','vue'],
  'AI/ML':     ['python','pytorch','tensorflow','scikit-learn','pandas','numpy','mlops','hugging face'],
  'Data':      ['python','sql','pandas','tableau','power bi','spark','excel','r'],
  'DevOps':    ['docker','kubernetes','aws','terraform','ci/cd','linux','ansible','monitoring'],
  'Full Stack':['react','node.js','mongodb','postgresql','docker','graphql','typescript','redis'],
}

function SkillBar({ skill, has }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-28 flex-shrink-0 capitalize truncate">{skill}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${has ? 'bg-brand-500' : 'bg-slate-700'}`}
          style={{ width: has ? '100%' : '20%' }}
        />
      </div>
      {has
        ? <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
        : <AlertCircle  size={13} className="text-slate-600   flex-shrink-0" />
      }
    </div>
  )
}

export default function SkillAnalysis({ parsed, analysis }) {
  const mySkills  = new Set((parsed?.skills || []).map(s => s.toLowerCase()))
  const missing   = analysis?.missing_skills || []

  return (
    <div className="space-y-4">
      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Skills Detected', value: mySkills.size, color: 'text-brand-400',   icon: '🛠️' },
          { label: 'ATS Score',       value: `${analysis?.ats_score ?? 0}%`, color: 'text-emerald-400', icon: '📊' },
          { label: 'Skill Gaps',      value: missing.length, color: 'text-rose-400', icon: '⚠️' },
          { label: 'Sections Found',  value: analysis?.sections_found?.length ?? 0, color: 'text-amber-400', icon: '📋' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="card p-4 text-center">
            <span className="text-2xl">{icon}</span>
            <p className={`text-2xl font-display font-bold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Role-based gap analysis */}
      {Object.entries(TOP_SKILLS_BY_ROLE).map(([role, skills]) => {
        const covered = skills.filter(s => mySkills.has(s)).length
        const pct     = Math.round((covered / skills.length) * 100)
        return (
          <div key={role} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-brand-400" />
                <h4 className="font-semibold text-white text-sm">{role} Readiness</h4>
              </div>
              <span className={`badge border ${
                pct >= 75 ? 'badge-green' :
                pct >= 50 ? 'badge-blue'  :
                pct >= 25 ? 'badge-amber' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {pct}% ready
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-800 rounded-full mb-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  pct >= 75 ? 'bg-emerald-500' :
                  pct >= 50 ? 'bg-brand-500'   :
                  pct >= 25 ? 'bg-amber-500'   : 'bg-rose-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="space-y-2">
              {skills.map(s => (
                <SkillBar key={s} skill={s} has={mySkills.has(s)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
