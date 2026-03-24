import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react'
import api from '../../services/api'

const SUGGESTIONS = [
  'What jobs fit my resume?',
  'Which skills am I missing?',
  'Show remote AI jobs',
  "What's my ATS score?",
  'My skills',
]

function Message({ msg }) {
  const isBot = msg.role === 'assistant'
  return (
    <div className={`flex gap-3 animate-slide-up ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isBot
          ? 'bg-brand-500/15 border border-brand-500/20'
          : 'bg-gradient-to-br from-brand-400 to-accent-500'
      }`}>
        {isBot
          ? <Bot size={15} className="text-brand-400" />
          : <User size={15} className="text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isBot
          ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
          : 'bg-brand-500 text-white rounded-tr-sm'
      }`}>
        {/* Render markdown-style bold */}
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
            {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        ))}
        <p className={`text-xs mt-1.5 ${isBot ? 'text-slate-500' : 'text-brand-200'}`}>
          {msg.time}
        </p>
      </div>
    </div>
  )
}

export default function AssistantPanel() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI career assistant. 👋\n\nI can help you find matching jobs, identify skill gaps, check your ATS score, and more. What would you like to know?",
      time: 'Just now',
    }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(m => [...m, { role: 'user', content: q, time: now }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/assistant/query', { query: q })
      setMessages(m => [...m, {
        role: 'assistant',
        content: data.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Sorry, I ran into an error. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80">
        <div className="w-9 h-9 bg-brand-500/15 border border-brand-500/20 rounded-xl flex items-center justify-center">
          <Bot size={18} className="text-brand-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">AI Career Assistant</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-slow" />
            <span className="text-xs text-slate-500">Online · Powered by ResumeAI</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-brand-400" />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-brand-400" />
              <span className="text-sm text-slate-400">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-5 py-2 border-t border-slate-800/60">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="flex-shrink-0 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
            >
              <Sparkles size={9} className="text-brand-400" />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-slate-800/80">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask me anything about your career…"
            disabled={loading}
            className="input flex-1 text-sm"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn-primary px-3 py-2 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
