import { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, Zap, CheckCircle, AlertTriangle, BookOpen,
  Calendar, ArrowRight, Flame, Target, Star, Activity,
  Users, TrendingUp, Battery, Wifi, WifiOff
} from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

/* ── Animated greeting ── */
function Greeting() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const emoji = hour < 12 ? '☀️' : hour < 17 ? '⚡' : '🌙'

  return (
    <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, padding: '20px 0' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 18px', borderRadius: 99,
        background: 'rgba(108,99,255,0.12)',
        border: '1px solid rgba(108,99,255,0.25)',
        fontSize: '0.78rem', fontWeight: 500,
        color: 'var(--accent-primary)',
        marginBottom: 14, letterSpacing: '0.04em'
      }}>
        <span style={{ fontSize: 10, opacity: 0.7 }}>●</span>
        AI Sidekick Active · 3 Deadlines on Radar
      </div>

      <div style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '2.6rem',
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        background: 'var(--grad-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: 8
      }}>
        {greeting}, Renee {emoji}
      </div>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: 460,
        margin: '0 auto',
        lineHeight: 1.6
      }}>
        Your OS Lab viva is tomorrow. CN Theory attendance is at <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>58%</span> — you need to attend next 4 classes to recover.
      </p>
    </div>
  )
}

/* ── Spline 3D Hero with polished fallback ── */
function Hero3D() {
  const [splineError, setSplineError] = useState(false)
  const [splineLoaded, setSplineLoaded] = useState(false)

  return (
    <div style={{
      width: '100%', height: 300,
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      position: 'relative',
      background: 'radial-gradient(ellipse at 30% 50%, rgba(108,99,255,0.12) 0%, rgba(0,212,255,0.05) 50%, var(--bg-dark) 100%)',
    }}>
      {/* Animated orbs fallback / background */}
      <div style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[
          { w: 280, h: 280, bg: 'rgba(108,99,255,0.18)', top: '-60px', left: '-60px', delay: '0s' },
          { w: 200, h: 200, bg: 'rgba(0,212,255,0.12)', top: '40px', right: '-40px', delay: '-4s' },
          { w: 150, h: 150, bg: 'rgba(255,107,157,0.1)', bottom: '-30px', left: '40%', delay: '-7s' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: orb.w, height: orb.h,
            borderRadius: '50%',
            background: orb.bg,
            filter: 'blur(60px)',
            top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
            animation: `orb-float 10s ease-in-out ${orb.delay} infinite`
          }} />
        ))}
      </div>

      {/* Spline — loads lazily, graceful fallback */}
      {!splineError && (
        <Suspense fallback={null}>
          <Spline
            scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
            onLoad={() => setSplineLoaded(true)}
            onError={() => setSplineError(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              opacity: splineLoaded ? 1 : 0,
              transition: 'opacity 0.8s ease'
            }}
          />
        </Suspense>
      )}

      {/* Content overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <Greeting />
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to top, var(--bg-void) 0%, transparent 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  )
}

/* ── Live clock ── */
function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '2rem', fontWeight: 800,
        background: 'var(--grad-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '-0.02em', lineHeight: 1
      }}>
        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
        {time.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

/* ── Attendance donut ── */
function AttRing({ subject, percent, canBunk }) {
  const R = 28, C = 2 * Math.PI * R
  const offset = C - (percent / 100) * C
  const color = percent >= 75 ? 'var(--accent-green)' : percent >= 65 ? 'var(--accent-orange)' : 'var(--accent-red)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="32" cy="32" r={R} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 32 32)"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 1.2s ease' }}
        />
        <text x="32" y="36" textAnchor="middle" fill={color} fontSize="11" fontWeight="700" fontFamily="JetBrains Mono">
          {percent}%
        </text>
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 3 }}>{subject}</div>
        <div style={{ fontSize: '0.72rem' }}>
          {canBunk > 0
            ? <span style={{ color: 'var(--accent-green)' }}>✓ Bunk {canBunk} more</span>
            : <span style={{ color: 'var(--accent-red)' }}>✗ Attend {Math.abs(canBunk)} ASAP</span>}
        </div>
      </div>
    </div>
  )
}

/* ── Quick action ── */
function QuickAction({ icon: Icon, label, sub, to, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = `${color}50`
        e.currentTarget.style.background = `${color}08`
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}15`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.background = 'var(--bg-card)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{label}</div>
          {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
        </div>
        <ArrowRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
      </div>
    </Link>
  )
}

/* ── Lumina AI Card ── */
function LuminaInsight() {
  const insights = [
    { icon: '🎯', text: <>CN Theory at <strong style={{ color: 'var(--accent-red)' }}>58%</strong> — attend next 4 classes to recover above 75%.</> },
    { icon: '⚡', text: <>You had <strong style={{ color: 'var(--accent-orange)' }}>6 app switches</strong> after 10 PM yesterday. Try the Night Lock mode.</> },
    { icon: '📅', text: <>DBMS Assignment due <strong style={{ color: 'var(--accent-red)' }}>tonight 11:59 PM</strong>. 3 teammates haven't pushed yet.</> },
    { icon: '💸', text: <>You spent <strong style={{ color: 'var(--accent-orange)' }}>₹380 on coffee</strong> this week. That's 8% of your budget.</> },
  ]
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % insights.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(0,212,255,0.06) 100%)',
      border: '1px solid rgba(108,99,255,0.22)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(108,99,255,0.08)', filter: 'blur(20px)'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'var(--grad-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Star size={13} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Lumina AI Insight</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {insights.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 16 : 5, height: 5, borderRadius: 99,
              background: i === current ? 'var(--accent-primary)' : 'var(--border-subtle)',
              transition: 'all 0.3s ease', cursor: 'pointer'
            }} onClick={() => setCurrent(i)} />
          ))}
        </div>
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {insights[current].icon} {insights[current].text}
      </p>
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '7px 14px' }}>
          <Activity size={11} /> View Plan
        </button>
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
const statCards = [
  {
    label: 'Overall Attendance', value: '74%', icon: Clock, variant: 'danger',
    change: '-1.2% this week', dir: 'negative',
    sub: '188/254 classes'
  },
  {
    label: 'Cognitive Debt', value: '6.4', icon: Zap, variant: 'orange',
    change: '+0.8 today', dir: 'negative',
    sub: 'High context load'
  },
  {
    label: 'Tasks Done', value: '12', icon: CheckCircle, variant: 'success',
    change: '+3 this week', dir: 'positive',
    sub: '12 / 22 tasks'
  },
  {
    label: 'Study Streak', value: '5d', icon: Flame, variant: 'secondary',
    change: 'Personal best!', dir: 'positive',
    sub: 'Keep it up 🔥'
  },
]

const attendance = [
  { subject: 'Data Structures', percent: 80, canBunk: 4 },
  { subject: 'DBMS', percent: 72, canBunk: 1 },
  { subject: 'OS Lab', percent: 64, canBunk: -2 },
  { subject: 'Compiler Design', percent: 78, canBunk: 3 },
  { subject: 'CN Theory', percent: 58, canBunk: -5 },
]

const upcoming = [
  { label: 'DBMS Assignment Due', time: 'Tonight 11:59 PM', urgent: true, icon: '📝' },
  { label: 'OS Lab Viva', time: 'Tomorrow 9:00 AM', urgent: true, icon: '🔬' },
  { label: 'Mid-Sem: Compiler Design', time: 'Apr 22 · 9 AM', urgent: false, icon: '📚' },
  { label: 'Project Sync Meet', time: 'Apr 19 · 4:00 PM', urgent: false, icon: '👥' },
  { label: 'Holiday', time: 'Apr 21 · All Day', urgent: false, icon: '🏖️' },
]

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'slide-up 0.5s ease forwards' }}>
      {/* 3D Hero */}
      <Hero3D />

      {/* Stats row */}
      <div className="grid-4">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className={`stat-icon ${s.variant}`} style={{ width: 36, height: 36, borderRadius: 10 }}>
                <s.icon size={17} />
              </div>
              <span className={`stat-change ${s.dir}`} style={{ fontSize: '0.68rem' }}>
                {s.dir === 'positive' ? '↑' : '↓'} {s.change}
              </span>
            </div>
            <div className="stat-value" style={{ fontSize: '1.9rem' }}>{s.value}</div>
            <div className="stat-label" style={{ marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 18 }}>

        {/* Col 1: Attendance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Clock size={14} color="var(--accent-primary)" />
                Attendance
              </div>
              <Link to="/timetable" style={{
                fontSize: '0.75rem', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                Manage <ArrowRight size={11} />
              </Link>
            </div>
            {attendance.map(a => <AttRing key={a.subject} {...a} />)}
          </div>
        </div>

        {/* Col 2: Quick Actions + AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <LuminaInsight />

          <div className="card" style={{ padding: '18px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Target size={14} color="var(--accent-secondary)" />
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <QuickAction icon={Zap} label="Log Focus Session" sub="ContextSwitch — track app switches" to="/focus" color="#6c63ff" />
              <QuickAction icon={Users} label="Open Group Chat" sub="3 unread messages" to="/hub" color="#00d4ff" />
              <QuickAction icon={Target} label="Add Kanban Task" sub="12 tasks in progress" to="/kanban" color="#00e5a0" />
              <QuickAction icon={BookOpen} label="Ask Second Brain" sub="5 docs indexed" to="/brain" color="#ff6b9d" />
            </div>
          </div>
        </div>

        {/* Col 3: Upcoming + Clock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <LiveClock />

          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color="var(--accent-tertiary)" />
                Upcoming
              </div>
              <Link to="/calendar" style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>See all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map((u, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: u.urgent ? 'rgba(255,71,87,0.06)' : 'var(--bg-glass-light)',
                  border: `1px solid ${u.urgent ? 'rgba(255,71,87,0.18)' : 'var(--border-subtle)'}`,
                  alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1 }}>{u.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.78rem', fontWeight: 600,
                      color: u.urgent ? 'var(--accent-red)' : 'var(--text-primary)'
                    }}>{u.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{u.time}</div>
                  </div>
                  {u.urgent && <AlertTriangle size={11} color="var(--accent-orange)" style={{ marginTop: 2, flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Battery Guardian */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0,229,160,0.06)',
            border: '1px solid rgba(0,229,160,0.18)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <Battery size={16} color="var(--accent-green)" />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-green)' }}>Smart Battery Guardian</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>
                Battery 82% · RAG indexing active
              </div>
            </div>
            <div style={{
              marginLeft: 'auto', fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              color: 'var(--accent-green)'
            }}>82%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
