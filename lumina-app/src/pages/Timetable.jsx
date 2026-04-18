import { useState, useRef } from 'react'
import { Upload, Camera, CheckCircle, AlertTriangle, Plus, Minus } from 'lucide-react'

const subjects = [
  { id: 1, name: 'Data Structures', code: 'CS301', total: 40, attended: 32, schedule: ['Mon 9AM', 'Wed 9AM', 'Fri 9AM'] },
  { id: 2, name: 'Database Management', code: 'CS302', total: 36, attended: 26, schedule: ['Mon 11AM', 'Thu 11AM'] },
  { id: 3, name: 'Operating Systems', code: 'CS303', total: 38, attended: 24, schedule: ['Tue 10AM', 'Thu 2PM', 'Sat 10AM'] },
  { id: 4, name: 'Compiler Design', code: 'CS304', total: 34, attended: 27, schedule: ['Mon 2PM', 'Wed 2PM'] },
  { id: 5, name: 'Computer Networks', code: 'CS305', total: 35, attended: 20, schedule: ['Tue 9AM', 'Fri 11AM'] },
  { id: 6, name: 'OS Lab', code: 'CS303L', total: 20, attended: 13, schedule: ['Sat 2PM'] },
]

function SubjectCard({ subject, onAttend }) {
  const percent = Math.round((subject.attended / subject.total) * 100)
  const safe = percent >= 75
  const warning = percent >= 65 && percent < 75
  const danger = percent < 65

  // Bunk analytics: how many can be missed
  // attend_needed = ceil(0.75 * total) - attended
  const minAttended = Math.ceil(0.75 * subject.total)
  const canBunk = subject.attended - Math.ceil(0.75 * subject.total)

  // How many future classes: assume 10 remaining on average
  const futureClasses = 10
  const futureBunks = Math.floor((subject.attended + futureClasses - 0.75 * (subject.total + futureClasses)) / 0.25)

  const r = 40, c = 2 * Math.PI * r
  const color = safe ? 'var(--accent-green)' : warning ? 'var(--accent-orange)' : 'var(--accent-red)'

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={c - (percent / 100) * c}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
          />
          <text x="50" y="46" textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="JetBrains Mono">
            {percent}%
          </text>
          <text x="50" y="62" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
            {subject.attended}/{subject.total}
          </text>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{subject.name}</div>
          <div className="tag" style={{ marginBottom: 8 }}>{subject.code}</div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: safe ? 'rgba(0,229,160,0.08)' : danger ? 'rgba(255,71,87,0.08)' : 'rgba(255,149,0,0.08)',
              border: `1px solid ${safe ? 'rgba(0,229,160,0.2)' : danger ? 'rgba(255,71,87,0.2)' : 'rgba(255,149,0,0.2)'}`,
              fontSize: '0.78rem',
              color: color,
              fontWeight: 600,
            }}>
              {canBunk > 0
                ? `✓ Can bunk ${canBunk} classes`
                : `✗ Attend ${Math.abs(canBunk)} more`
              }
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {subject.schedule.map(s => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '8px 0' }}
          onClick={() => onAttend(subject.id, 'present')}
          id={`attend-present-${subject.id}`}
        >
          <CheckCircle size={14} /> Mark Present
        </button>
        <button
          className="btn-ghost"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
          onClick={() => onAttend(subject.id, 'absent')}
          id={`attend-absent-${subject.id}`}
        >
          <AlertTriangle size={14} /> Mark Absent
        </button>
      </div>
    </div>
  )
}

export default function Timetable() {
  const [subjects_, setSubjects] = useState(subjects)
  const [uploadState, setUploadState] = useState('idle') // idle | uploading | parsing | done
  const [activeDay, setActiveDay] = useState('Mon')
  const fileRef = useRef()

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleUpload = () => {
    setUploadState('uploading')
    setTimeout(() => setUploadState('parsing'), 1500)
    setTimeout(() => setUploadState('done'), 3500)
  }

  const handleAttend = (id, status) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s
      return {
        ...s,
        total: s.total + 1,
        attended: status === 'present' ? s.attended + 1 : s.attended
      }
    }))
  }

  const overallPercent = Math.round(
    (subjects_.reduce((a, s) => a + s.attended, 0) / subjects_.reduce((a, s) => a + s.total, 0)) * 100
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Timetable & Attendance</h1>
            <p className="page-subtitle">AI-parsed schedule with real-time bunk analytics</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-ghost"
              onClick={() => fileRef.current?.click()}
              id="upload-img-btn"
            >
              <Camera size={16} /> Upload Image
            </button>
            <button
              className="btn-primary"
              onClick={handleUpload}
              id="upload-pdf-btn"
            >
              <Upload size={16} /> Upload PDF
            </button>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} />
          </div>
        </div>
      </div>

      {/* AI Parse status */}
      {uploadState !== 'idle' && (
        <div style={{
          background: 'rgba(108,99,255,0.08)',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          {uploadState === 'uploading' && (
            <>
              <div style={{
                width: 20, height: 20, border: '2px solid var(--accent-primary)',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <span style={{ fontSize: '0.875rem' }}>Uploading timetable file...</span>
            </>
          )}
          {uploadState === 'parsing' && (
            <>
              <div style={{
                width: 20, height: 20, border: '2px solid var(--accent-secondary)',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <span style={{ fontSize: '0.875rem' }}>🧠 Lumina OCR parsing subjects and timings...</span>
            </>
          )}
          {uploadState === 'done' && (
            <>
              <CheckCircle size={20} color="var(--accent-green)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--accent-green)' }}>
                Timetable parsed! 6 subjects, 12 weekly classes detected.
              </span>
            </>
          )}
        </div>
      )}

      {/* Overall stat */}
      <div style={{
        background: 'var(--grad-hero)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 24
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3.5rem', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
            {overallPercent}%
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Overall Attendance</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="progress-bar-wrap">
            <div
              className={`progress-bar-fill ${overallPercent >= 75 ? 'success' : 'danger'}`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
            <span>0%</span>
            <span style={{ color: 'var(--accent-orange)' }}>Threshold: 75%</span>
            <span>100%</span>
          </div>
        </div>
        <div style={{
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          background: overallPercent >= 75 ? 'rgba(0,229,160,0.1)' : 'rgba(255,71,87,0.1)',
          border: `1px solid ${overallPercent >= 75 ? 'rgba(0,229,160,0.3)' : 'rgba(255,71,87,0.3)'}`,
          color: overallPercent >= 75 ? 'var(--accent-green)' : 'var(--accent-red)',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          {overallPercent >= 75 ? '✓ Safe Zone' : '✗ Critical'}
        </div>
      </div>

      {/* Day tabs */}
      <div className="tabs" style={{ width: 'fit-content' }}>
        {days.map(d => (
          <button
            key={d}
            className={`tab-btn${activeDay === d ? ' active' : ''}`}
            onClick={() => setActiveDay(d)}
            id={`day-tab-${d.toLowerCase()}`}
          >{d}</button>
        ))}
      </div>

      {/* Subject grid */}
      <div className="grid-3">
        {subjects_.map(s => <SubjectCard key={s.id} subject={s} onAttend={handleAttend} />)}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
