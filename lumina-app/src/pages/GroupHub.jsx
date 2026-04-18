import { useState, useRef, useEffect } from 'react'
import { Send, Code, PenLine, Pin, Users, Plus, X, Paperclip, Smile } from 'lucide-react'

const initialMessages = [
  { id: 1, user: 'Yash', avatar: 'Y', text: 'Hey team, here\'s the approach for the DBMS normalization assignment 👇', time: '2:14 PM', own: false },
  { id: 2, user: 'Yash', avatar: 'Y', text: '1NF → 2NF → 3NF. Start with removing partial deps in the Student table.', time: '2:14 PM', own: false, code: false },
  { id: 3, user: 'Priya', avatar: 'P', text: 'Agreed. I\'ll handle the ER diagram on the whiteboard, drop your entities below!', time: '2:17 PM', own: false },
  { id: 4, user: 'Me', avatar: 'R', text: 'CREATE TABLE Student (sid INT PRIMARY KEY, name VARCHAR, dept_id INT REFERENCES Dept(id));', time: '2:19 PM', own: true, isCode: true },
  { id: 5, user: 'Aryan', avatar: 'A', text: '🔥 Nice schema. Adding foreign key for Enrollment table now.', time: '2:21 PM', own: false },
]

const pinnedItems = [
  { id: 1, type: 'code', label: 'Student Schema SQL', content: 'CREATE TABLE Student...', user: 'Renee' },
  { id: 2, type: 'note', label: 'Assignment deadline: Mon 11:59 PM', content: '', user: 'Yash' },
  { id: 3, type: 'link', label: 'DBMS Slides PDF', content: '', user: 'Priya' },
]

const whiteboardItems = [
  { id: 'student', label: 'Student', x: 60, y: 40, color: '#6c63ff' },
  { id: 'dept', label: 'Department', x: 300, y: 40, color: '#00d4ff' },
  { id: 'enroll', label: 'Enrollment', x: 180, y: 180, color: '#ff6b9d' },
  { id: 'course', label: 'Course', x: 300, y: 200, color: '#00e5a0' },
]

function Whiteboard() {
  const [items, setItems] = useState(whiteboardItems)
  const [dragging, setDragging] = useState(null)
  const [connections] = useState([
    ['student', 'enroll'],
    ['dept', 'enroll'],
    ['enroll', 'course'],
  ])
  const svgRef = useRef()

  const getItem = id => items.find(i => i.id === id)

  const handleMouseDown = (e, id) => {
    const rect = svgRef.current.getBoundingClientRect()
    setDragging({ id, offX: e.clientX - rect.left - getItem(id).x, offY: e.clientY - rect.top - getItem(id).y })
  }

  const handleMouseMove = e => {
    if (!dragging) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragging.offX
    const y = e.clientY - rect.top - dragging.offY
    setItems(prev => prev.map(i => i.id === dragging.id ? { ...i, x, y } : i))
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--bg-dark)'
      }}>
        <PenLine size={14} color="var(--accent-secondary)" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Live Whiteboard</span>
        <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>4 online</span>
      </div>
      <svg
        ref={svgRef}
        width="100%" height="280"
        style={{ display: 'block', cursor: dragging ? 'grabbing' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
      >
        {/* Grid dots */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connections */}
        {connections.map(([a, b], i) => {
          const ia = getItem(a), ib = getItem(b)
          if (!ia || !ib) return null
          return (
            <line key={i}
              x1={ia.x + 60} y1={ia.y + 20}
              x2={ib.x + 60} y2={ib.y + 20}
              stroke="rgba(108,99,255,0.3)" strokeWidth="1.5"
              strokeDasharray="4,4"
            />
          )
        })}

        {/* Entity boxes */}
        {items.map(item => (
          <g key={item.id} transform={`translate(${item.x},${item.y})`}
            onMouseDown={e => handleMouseDown(e, item.id)}
            style={{ cursor: 'grab' }}
          >
            <rect width="120" height="40" rx="8"
              fill={`${item.color}20`}
              stroke={item.color}
              strokeWidth="1.5"
            />
            <text x="60" y="25" textAnchor="middle"
              fill={item.color} fontSize="12" fontWeight="600"
              fontFamily="var(--font-primary)"
            >{item.label}</text>
          </g>
        ))}
      </svg>
      <div style={{ padding: '8px 14px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
        Drag entities • Real-time sync via Socket.io
      </div>
    </div>
  )
}

function Pasteboard() {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-dark)'
      }}>
        <Pin size={14} color="var(--accent-tertiary)" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Pinboard</span>
        <button style={{
          marginLeft: 'auto', width: 22, height: 22,
          borderRadius: 6, background: 'rgba(108,99,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none'
        }}>
          <Plus size={12} color="var(--accent-primary)" />
        </button>
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pinnedItems.map(item => (
          <div key={item.id} style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: '0.82rem'
          }}>
            <div style={{
              width: 6, flexShrink: 0, height: 6, borderRadius: '50%',
              background: item.type === 'code' ? 'var(--accent-primary)' : item.type === 'link' ? 'var(--accent-secondary)' : 'var(--accent-green)'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Pinned by {item.user}</div>
            </div>
            {item.type === 'code' && <Code size={12} color="var(--accent-primary)" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GroupHub() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const chatEndRef = useRef()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: 'Me', avatar: 'R',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      own: true,
      isCode: input.startsWith('```') || input.includes('SELECT') || input.includes('CREATE')
    }])
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Group Discussion Hub</h1>
            <p className="page-subtitle">Real-time collaboration with whiteboard & pasteboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['Y','P','A','S'].map(a => (
              <div key={a} style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--grad-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'white',
                border: '2px solid var(--bg-void)',
                marginLeft: a !== 'Y' ? -8 : 0
              }}>{a}</div>
            ))}
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginLeft: 8 }}>● 4 online</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Main chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tabs */}
          <div className="tabs" style={{ width: 'fit-content' }}>
            {[
              { id: 'chat', label: '💬 Chat' },
              { id: 'whiteboard', label: '🎨 Whiteboard' },
            ].map(t => (
              <button key={t.id} className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)} id={`tab-${t.id}`}>{t.label}</button>
            ))}
          </div>

          {activeTab === 'chat' ? (
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', height: 480 }}>
              {/* Messages */}
              <div className="chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} style={{
                    display: 'flex', gap: 10,
                    flexDirection: msg.own ? 'row-reverse' : 'row',
                    alignItems: 'flex-start'
                  }}>
                    {!msg.own && (
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'var(--grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0
                      }}>{msg.avatar}</div>
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      {!msg.own && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4, paddingLeft: 2 }}>
                          {msg.user} · {msg.time}
                        </div>
                      )}
                      <div className={`chat-bubble ${msg.own ? 'own' : 'other'}`}
                        style={msg.isCode ? { fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: msg.own ? 'var(--grad-primary)' : 'var(--bg-surface)' } : {}}
                      >
                        {msg.text}
                      </div>
                      {msg.own && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                          {msg.time}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-row">
                <button className="nav-icon-btn" id="attach-btn"><Paperclip size={15} /></button>
                <input
                  id="chat-message-input"
                  className="chat-input"
                  placeholder="Type a message, paste code, or share a link..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  className="btn-primary"
                  style={{ padding: '9px 16px' }}
                  onClick={sendMessage}
                  id="send-message-btn"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          ) : (
            <Whiteboard />
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Pasteboard />

          {/* Members */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} color="var(--accent-secondary)" /> Members
            </div>
            {[
              { name: 'Renee (You)', avatar: 'R', status: 'online' },
              { name: 'Yash', avatar: 'Y', status: 'online' },
              { name: 'Priya', avatar: 'P', status: 'online' },
              { name: 'Aryan', avatar: 'A', status: 'away' },
              { name: 'Siddhi', avatar: 'S', status: 'online' },
            ].map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--grad-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: 'white'
                  }}>{m.avatar}</div>
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 8, height: 8, borderRadius: '50%',
                    background: m.status === 'online' ? 'var(--accent-green)' : 'var(--accent-orange)',
                    border: '1.5px solid var(--bg-card)'
                  }} />
                </div>
                <span style={{ fontSize: '0.8rem', color: m.name.includes('You') ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
