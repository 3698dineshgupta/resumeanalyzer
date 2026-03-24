import { User, Mail, Phone, BookOpen, Briefcase, FolderGit2, Code2, Download, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function ResumeSummary({ parsed, filename, uploadedAt }) {
  if (!parsed) {
    return (
      <div className="card p-10 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload size={28} className="text-slate-500" />
        </div>
        <h3 className="text-xl font-display font-semibold text-white mb-2">No resume yet</h3>
        <p className="text-slate-400 mb-5">Upload your resume to unlock job matching and ATS scoring</p>
        <Link to="/upload" className="btn-primary inline-flex">
          <Upload size={16} /> Upload Resume
        </Link>
      </div>
    )
  }

  const exportJSON = async () => {
    try {
      const { data } = await api.get('/resume/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'resume_data.json'; a.click()
      URL.revokeObjectURL(url)
      toast.success('Resume data exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="card p-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
            <span className="text-2xl font-display font-bold text-white">
              {parsed.name?.charAt(0)?.toUpperCase() || 'R'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-white">{parsed.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1">
              {parsed.email && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Mail size={11} /> {parsed.email}
                </span>
              )}
              {parsed.phone && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Phone size={11} /> {parsed.phone}
                </span>
              )}
            </div>
            {filename && (
              <p className="text-xs text-slate-600 mt-1">
                📄 {filename}
                {uploadedAt && ` · ${new Date(uploadedAt).toLocaleDateString()}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={exportJSON} className="btn-ghost text-xs py-2 px-3">
            <Download size={13} /> Export JSON
          </button>
          <Link to="/upload" className="btn-secondary text-xs py-2 px-3">
            <Upload size={13} /> Re-upload
          </Link>
        </div>
      </div>

      {/* Skills */}
      {parsed.skills?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={15} className="text-brand-400" />
            <h4 className="font-semibold text-white text-sm">Skills Detected</h4>
            <span className="badge-blue ml-auto">{parsed.skills.length} skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsed.skills.map(s => (
              <span key={s} className="badge-blue px-3 py-1 capitalize">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {parsed.education?.length > 0 && (
        <Section icon={<BookOpen size={15} className="text-accent-400" />} title="Education">
          {parsed.education.map((e, i) => <BulletItem key={i} text={e} />)}
        </Section>
      )}

      {/* Experience */}
      {parsed.experience?.length > 0 && (
        <Section icon={<Briefcase size={15} className="text-amber-400" />} title="Experience">
          {parsed.experience.map((e, i) => <BulletItem key={i} text={e} />)}
        </Section>
      )}

      {/* Projects */}
      {parsed.projects?.length > 0 && (
        <Section icon={<FolderGit2 size={15} className="text-emerald-400" />} title="Projects">
          {parsed.projects.map((p, i) => <BulletItem key={i} text={p} />)}
        </Section>
      )}
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-white text-sm">{title}</h4>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function BulletItem({ text }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
      <span className="leading-relaxed">{text}</span>
    </li>
  )
}
