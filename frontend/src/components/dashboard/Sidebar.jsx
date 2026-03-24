import { Link, useLocation } from 'react-router-dom'
import {
  Zap, LayoutDashboard, Upload, Briefcase, MapPin, Globe,
  CheckSquare, BarChart2, Bot, Bookmark, LogOut, Menu, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import clsx from 'clsx'

const NAV = [
  { id: 'overview',    label: 'Overview',       icon: LayoutDashboard },
  { id: 'recommended', label: 'Recommended',    icon: Briefcase },
  { id: 'nearby',      label: 'Nearby Jobs',    icon: MapPin },
  { id: 'remote',      label: 'Remote Jobs',    icon: Globe },
  { id: 'applied',     label: 'Applied',        icon: CheckSquare },
  { id: 'saved',       label: 'Saved Jobs',     icon: Bookmark },
  { id: 'analysis',    label: 'Skill Analysis', icon: BarChart2 },
  { id: 'assistant',   label: 'AI Assistant',   icon: Bot },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth()
  const [open, setOpen]  = useState(false)

  const NavItem = ({ item }) => (
    <button
      onClick={() => { setActiveTab(item.id); setOpen(false) }}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
        activeTab === item.id
          ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      )}
    >
      <item.icon size={17} className={activeTab === item.id ? 'text-brand-400' : ''} />
      {item.label}
    </button>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800/80">
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <span className="font-display font-semibold text-white text-lg leading-none">ResumeAI</span>
          <p className="text-xs text-slate-500 mt-0.5">Career Assistant</p>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Upload button */}
      <div className="px-4 pt-4">
        <Link to="/upload" className="btn-primary w-full justify-center py-2.5 text-sm">
          <Upload size={15} /> Upload Resume
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-slate-900/80 border-r border-slate-800/80 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-display font-semibold text-white">ResumeAI</span>
        </div>
        <button onClick={() => setOpen(s => !s)} className="text-slate-400 hover:text-white p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
