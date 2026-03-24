import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, Loader2, Zap, ArrowLeft, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'

export default function UploadPage() {
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const navigate              = useNavigate()

  const onDrop = useCallback(accepted => {
    if (accepted.length) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 16 * 1024 * 1024,
    onDropRejected: () => toast.error('Only PDF/DOCX files up to 16MB are accepted'),
  })

  const upload = async () => {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setLoading(true)
    try {
      await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDone(true)
      toast.success('Resume parsed successfully!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fmtSize = bytes => bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/')} className="btn-ghost p-2">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white">ResumeAI</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-semibold text-white mb-3">
            Upload your resume
          </h1>
          <p className="text-slate-400 text-lg">
            We'll parse it, score it, and match you with the best jobs
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            '🧠 AI-Powered Parsing',
            '📊 ATS Score',
            '💼 Job Matching',
            '🎯 Skill Gap Analysis',
          ].map(f => (
            <span key={f} className="badge-slate px-3 py-1 text-sm">{f}</span>
          ))}
        </div>

        <div className="card p-8">
          {done ? (
            /* Success state */
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">Resume uploaded!</h3>
              <p className="text-slate-400">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
                  ${isDragActive
                    ? 'border-brand-400 bg-brand-500/10'
                    : file
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'}
                `}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center">
                      <FileText size={28} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{file.name}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{fmtSize(file.size)}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      className="btn-ghost text-slate-500 hover:text-rose-400 mt-1 py-1 px-2"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all
                      ${isDragActive ? 'bg-brand-500/20' : 'bg-slate-800'}`}>
                      <Upload size={28} className={isDragActive ? 'text-brand-400' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                      </p>
                      <p className="text-slate-400 mt-1">or <span className="text-brand-400">click to browse</span></p>
                      <p className="text-xs text-slate-600 mt-3">PDF, DOC, DOCX • Max 16 MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload button */}
              {file && (
                <button
                  onClick={upload}
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 mt-5 text-base"
                >
                  {loading
                    ? <><Loader2 size={20} className="animate-spin" /> Analyzing resume…</>
                    : <><Zap size={20} /> Analyze my resume</>
                  }
                </button>
              )}

              {/* Accepted formats note */}
              <p className="text-xs text-center text-slate-600 mt-4">
                Your data is processed locally and stored securely. We never share your resume.
              </p>
            </>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: '📝', tip: 'Use a clean, ATS-friendly format' },
            { icon: '🎯', tip: 'Include keywords from job descriptions' },
            { icon: '📊', tip: 'Quantify your achievements' },
          ].map(({ icon, tip }) => (
            <div key={tip} className="card p-3 text-center">
              <span className="text-xl">{icon}</span>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
