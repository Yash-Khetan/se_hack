import { useState, useEffect, useRef } from 'react'
import { Zap, PlayCircle, StopCircle, Users, TrendingUp, Eye } from 'lucide-react'

const INITIAL_DEBT = 3.2
const DECAY = 0.95

const appSwitches = [
  { app: 'VS Code', time: '14:00', duration: '42m', type: 'focus', color: '#007acc' },
  { app: 'YouTube', time: '14:42', duration: '18m', type: 'distract', color: '#ff0000' },
  { app: 'WhatsApp', time: '15:00', duration: '5m', type: 'distract', color: '#25d366' },
  { app: 'VS Code', time: '15:05', duration: '31m', type: 'focus', color: '#007acc' },
  { app: 'Instagram', time: '15:36', duration: '12m', type: 'distract', color: '#e1306c' },
  { app: 'Notion', time: '15:48', duration: '25m', type: 'focus', color: '#ffffff' },
]

const squadMembers = [
  { name: 'Yash', score: 2.1, status: 'In Flow 🔥', avatar: 'Y' },
  { name: 'Priya', score: 5.8, status: 'Switching apps 📱', avatar: 'P' },
  { name: 'Aryan', score: 1.4, status: 'Deep focus ⚡', avatar: 'A' },
  { name: 'Siddhi', score: 7.2, status: 'On break ☕', avatar: 'S' },
]

function CogDebtMeter({ score }) {
  const max = 10
  const pct = (score / max) * 100
  const color = score < 3 ? 'var(--accent-green)' : score < 6 ? 'var(--accent-orange)' : 'var(--accent-red)'
  const label = score < 3 ? 'In Flow' : score < 6 ? 'Moderate Debt' : 'High Context Load'

  return (
    <div style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>Cognitive Debt Score</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color }}>
          {score.toFixed(1)}
        </div>
      </div>

      <div className="cog-debt-bar" style={{ marginBottom: 8 }}>
        <div className="cog-debt-indicator" style={{ left: `${pct}%` }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12 }}>
        <span style={{ color: 'var(--accent-green)' }}>Flow (0-3)</span>
        <span style={{ color: 'var(--accent-orange)' }}>Alert (4-6)</span>
        <span style={{ color: 'var(--accent-red)' }}>Overload (7-10)</span>
      </div>

      <div style={{
        padding: '8px 14px',
        borderRadius: 'var(--radius-md)',
        background: `${color}15`,
        border: `1px solid ${color}40`,
        fontSize: '0.8rem',
        color,
        fontWeight: 600,
        textAlign: 'center'
      }}>
        {label}
      </div>
    </div>
  )
}

function FlowTimeline() {
  return (
    <div style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ fontWeight: 700, marginBottom: 16 }}>App Switch Timeline</div>
      <div style={{ position: 'relative', paddingLeft: 16 }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 4, top: 0, bottom: 0,
          width: 2, background: 'var(--border-subtle)'
        }} />

        {appSwitches.map((s, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: 16, paddingLeft: 20 }}>
            {/* Dot */}
            <div style={{
              position: 'absolute', left: -4, top: 4,
              width: 10, height: 10, borderRadius: '50%',
              background: s.color,
              boxShadow: `0 0 8px ${s.color}80`,
              border: '2px solid var(--bg-dark)'
            }} />

            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: s.type === 'focus' ? 'rgba(108,99,255,0.06)' : 'rgba(255,71,87,0.06)',
              border: `1px solid ${s.type === 'focus' ? 'rgba(108,99,255,0.15)' : 'rgba(255,71,87,0.15)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: s.color
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.app}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>{s.duration}</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.time}</span>
              <span className={`badge ${s.type === 'focus' ? 'badge-primary' : 'badge-danger'}`} style={{ fontSize: '0.6rem' }}>
                {s.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudySquad() {
  return (
    <div style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700 }}>Study Squad</div>
        <span className="badge badge-primary">Live 🟢</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {squadMembers.map(m => (
          <div key={m.name} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-glass-light)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--grad-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0
            }}>{m.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.status}</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: m.score < 3 ? 'var(--accent-green)' : m.score < 6 ? 'var(--accent-orange)' : 'var(--accent-red)'
            }}>
              {m.score.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Anonymized flow graphs — social accountability 🤝
      </div>
    </div>
  )
}

export default function ContextSwitch() {
  const [tracking, setTracking] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [cogDebt, setCogDebt] = useState(INITIAL_DEBT)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (tracking) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => e + 1)
        setCogDebt(d => parseFloat((d * DECAY).toFixed(2)))
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [tracking])

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1 className="page-title">ContextSwitch</h1>
        <p className="page-subtitle">"You said you were studying. Your phone disagrees."</p>
      </div>

      {/* Hero session card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(0,212,255,0.06) 100%)',
        border: '1px solid rgba(108,99,255,0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: 32,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="orb orb-1" style={{ top: -100, right: -50, opacity: 0.08 }} />
        <div className="orb orb-2" style={{ bottom: -80, left: -30, opacity: 0.06 }} />

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '4rem',
          fontWeight: 800,
          background: 'var(--grad-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
          position: 'relative'
        }}>
          {fmt(elapsed)}
        </div>

        <div style={{ color: 'var(--text-secondary)', marginBottom: 24, marginTop: 4, position: 'relative' }}>
          {tracking ? '⚡ Focus session in progress...' : 'Start a focus session to track app switches'}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative' }}>
          <button
            className={`btn-primary`}
            onClick={() => setTracking(t => !t)}
            id="focus-toggle-btn"
            style={{ padding: '14px 32px', fontSize: '1rem' }}
          >
            {tracking
              ? <><StopCircle size={18} /> Stop Session</>
              : <><PlayCircle size={18} /> Start Focus</>
            }
          </button>
          {tracking && (
            <button className="btn-ghost" onClick={() => { setTracking(false); setElapsed(0); setCogDebt(INITIAL_DEBT) }} id="reset-btn">
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CogDebtMeter score={cogDebt} />

          {/* Stats */}
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'App Switches', value: '6', icon: TrendingUp, color: 'orange' },
              { label: 'Focus Blocks', value: '3', icon: Zap, color: 'primary' },
              { label: '% Focus Time', value: '64%', icon: Eye, color: 'success' },
              { label: 'Max Block', value: '42m', icon: Users, color: 'secondary' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`}><s.icon size={16} /></div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StudySquad />
        </div>
      </div>

      {/* Timeline */}
      <FlowTimeline />
    </div>
  )
}
