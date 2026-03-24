import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const CATEGORIES = ['All', 'Backend', 'Frontend', 'Full Stack', 'AI/ML', 'Data', 'DevOps', 'Mobile', 'Product', 'Security']
const MODES      = [
  { label: 'All Types', value: '' },
  { label: '🌍 Remote',  value: 'remote' },
  { label: '🏢 Onsite',  value: 'onsite' },
  { label: '⚡ Hybrid',  value: 'hybrid' },
]

export default function JobFilters({ onFilter }) {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('All')
  const [mode,     setMode]     = useState('')

  const emit = (q = query, cat = category, m = mode) => {
    onFilter?.({
      query:    q,
      category: cat === 'All' ? '' : cat,
      job_type: m,
    })
  }

  return (
    <div className="space-y-3 mb-5">
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); emit(e.target.value) }}
          placeholder="Search jobs, companies, skills…"
          className="input pl-10"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); emit(query, c) }}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-all border',
              category === c
                ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Mode filter */}
      <div className="flex gap-2">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => { setMode(m.value); emit(query, category, m.value) }}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
              mode === m.value
                ? 'bg-slate-700 border-slate-500 text-white'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:text-slate-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
