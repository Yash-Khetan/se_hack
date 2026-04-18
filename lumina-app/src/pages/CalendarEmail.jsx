import { useState } from 'react'
import { Mail, Calendar, AlertTriangle, CheckCircle, Clock, Tag, ExternalLink, RefreshCw } from 'lucide-react'

// Generate heatmap data — 15 weeks × 7 days
function generateHeatmap() {
  const weeks = 15
  const data = []
  const stressKeywords = ['deadline', 'exam', 'submission', 'due', 'lab', 'viva', 'assignment', 'test']
  
  for (let w = 0; w < weeks; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const level = Math.floor(Math.random() * 5)
      week.push(level)
    }
    data.push(week)
  }
  // Spike some weeks to simulate deadlines
  data[3][2] = 4; data[3][3] = 4; data[3][4] = 3
  data[7][1] = 4; data[7][2] = 4; data[7][3] = 4
  data[11][4] = 4; data[11][5] = 3
  return data
}

const heatmapData = generateHeatmap()

const emails = [
  {
    id: 1, from: 'prof.sharma@college.edu', subject: '⚠️ DBMS Assignment Deadline Reminder',
    preview: 'This is a reminder that your database normalization assignment is due at 11:59 PM tonight...',
    time: '11:23 AM', keywords: ['deadline', 'assignment', 'due'],
    stress: 'high', read: false, calAdded: false
  },
  {
    id: 2, from: 'lab@cs.college.edu', subject: 'OS Lab Viva Schedule - Next Week',
    preview: 'The viva voce for OS Lab will be conducted on Saturday. Please be prepared with all experiments...',
    time: 'Yesterday', keywords: ['viva', 'lab'],
    stress: 'medium', read: true, calAdded: true
  },
  {
    id: 3, from: 'exam.cell@college.edu', subject: 'Mid-Semester Examination Timetable Released',
    preview: 'The timetable for mid-semester examinations has been released. Examinations begin from April 22nd...',
    time: 'Apr 16', keywords: ['exam', 'examination'],
    stress: 'high', read: true, calAdded: false
  },
  {
    id: 4, from: 'hod@cs.college.edu', subject: 'Project submission guidelines updated',
    preview: 'Please note the updated submission guidelines for the semester project. All groups must...',
    time: 'Apr 15', keywords: ['submission', 'project'],
    stress: 'medium', read: true, calAdded: false
  },
  {
    id: 5, from: 'noreply@college.edu', subject: 'Holiday Notice: Apr 21',
    preview: 'The college will remain closed on April 21st on account of the state holiday...',
    time: 'Apr 14', keywords: [],
    stress: 'low', read: true, calAdded: false
  },
]

const calEvents = [
  { id: 1, title: 'DBMS Assignment Due', date: 'Apr 18', time: '11:59 PM', color: 'var(--accent-red)', type: 'deadline' },
  { id: 2, title: 'OS Lab Viva', date: 'Apr 20', time: '10:00 AM', color: 'var(--accent-orange)', type: 'exam' },
  { id: 3, title: 'Mid-Sem: Compiler Design', date: 'Apr 22', time: '9:00 AM', color: 'var(--accent-red)', type: 'exam' },
  { id: 4, title: 'Project Sync Meet', date: 'Apr 19', time: '4:00 PM', color: 'var(--accent-primary)', type: 'meet' },
  { id: 5, title: 'Mid-Sem: DBMS', date: 'Apr 24', time: '9:00 AM', color: 'var(--accent-orange)', type: 'exam' },
  { id: 6, title: 'Holiday', date: 'Apr 21', time: 'All Day', color: 'var(--accent-green)', type: 'holiday' },
]

const stressColors = {
  0: '#0d1220',
  1: 'rgba(108,99,255,0.15)',
  2: 'rgba(108,99,255,0.35)',
  3: 'rgba(255,149,0,0.5)',
  4: 'rgba(255,71,87,0.7)',
}

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function StressMeter({ level }) {
  const levels = ['Relaxed 😊', 'Light 🙂', 'Moderate 😐', 'High 😬', 'DEADLINE CRUNCH 🔥']
  const colors = ['var(--accent-green)', 'var(--accent-secondary)', 'var(--accent-primary)', 'var(--accent-orange)', 'var(--accent-red)']
  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: 'var(--radius-lg)',
      background: `${colors[level]}15`,
      border: `1px solid ${colors[level]}40`,
      display: 'flex', alignItems: 'center', gap: 14
    }}>
      <div style={{ fontSize: '2rem' }}>
        {level === 4 ? '🔥' : level === 3 ? '😬' : level === 2 ? '😐' : level === 1 ? '🙂' : '😊'}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: colors[level], fontSize: '1rem' }}>{levels[level]}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Stress Meter — Based on upcoming deadlines & email keywords
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: 8, height: 28,
            borderRadius: 4,
            background: i <= level ? colors[Math.min(i + 1, 4)] : 'var(--bg-card)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
    </div>
  )
}

export default function CalendarEmail() {
  const [syncing, setSyncing] = useState(false)
  const [emails_, setEmails] = useState(emails)

  const stressLevel = 3 // High stress due to upcoming exams

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 2000)
  }

  const addToCalendar = (id) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, calAdded: true } : e))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Gmail & Calendar Heatmap</h1>
            <p className="page-subtitle">Visual stress meter that auto-detects academic deadlines</p>
          </div>
          <button
            className="btn-primary"
            onClick={handleSync}
            id="sync-btn"
            style={{ gap: 8 }}
          >
            <RefreshCw size={15} style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Stress meter */}
      <StressMeter level={stressLevel} />

      {/* Heatmap */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Semester Stress Heatmap</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: stressColors[0] }} /> Low
            <div style={{ width: 10, height: 10, borderRadius: 2, background: stressColors[2] }} /> Med
            <div style={{ width: 10, height: 10, borderRadius: 2, background: stressColors[4] }} /> High
          </div>
        </div>

        {/* Day labels */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
          <div style={{ width: 40 }} />
          {days.map((d, i) => (
            <div key={i} style={{ width: 14, fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {heatmapData.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {wi % 3 === 0 && (
                <div style={{ width: 40, fontSize: '0.6rem', color: 'var(--text-muted)' }}>Wk {wi + 1}</div>
              )}
              {wi % 3 !== 0 && <div style={{ width: 40 }} />}
              {week.map((level, di) => (
                <div
                  key={di}
                  className={`heatmap-cell heatmap-${level}`}
                  style={{
                    background: stressColors[level],
                    border: `1px solid rgba(255,255,255,0.04)`,
                    cursor: 'pointer'
                  }}
                  title={`Week ${wi+1}, Day ${di+1}: Stress level ${level}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid-2" style={{ gap: 20, gridTemplateColumns: '1fr 340px' }}>
        {/* Emails */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={16} color="var(--accent-secondary)" />
            Academic Emails
            <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>2 unread</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {emails_.map(email => (
              <div key={email.id} style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: !email.read ? 'rgba(108,99,255,0.04)' : 'transparent',
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}
              onMouseLeave={e => e.currentTarget.style.background = !email.read ? 'rgba(108,99,255,0.04)' : 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {!email.read && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: email.read ? 500 : 700, color: 'var(--text-primary)' }}>
                        {email.subject}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 10 }}>
                        {email.time}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      from {email.from}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                      {email.preview}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {email.keywords.map(k => (
                        <span key={k} className={`badge ${email.stress === 'high' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                          <Tag size={8} /> {k}
                        </span>
                      ))}
                      {!email.calAdded && email.keywords.length > 0 && (
                        <button
                          className="btn-ghost"
                          style={{ fontSize: '0.68rem', padding: '3px 10px', marginLeft: 'auto' }}
                          onClick={() => addToCalendar(email.id)}
                          id={`add-cal-${email.id}`}
                        >
                          + Add to Calendar
                        </button>
                      )}
                      {email.calAdded && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={10} /> In Calendar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar events */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="var(--accent-primary)" />
            Upcoming Events
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {calEvents.map(ev => (
              <div key={ev.id} style={{
                display: 'flex', gap: 12, padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: `1px solid ${ev.color}30`,
                alignItems: 'center'
              }}>
                <div style={{
                  width: 4, height: 40, borderRadius: 2,
                  background: ev.color, flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{ev.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                    <Clock size={10} /> {ev.date} · {ev.time}
                  </div>
                </div>
                <span className="tag" style={{ fontSize: '0.65rem' }}>{ev.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
