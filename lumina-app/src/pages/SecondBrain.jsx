import { useState, useRef, useEffect } from 'react'
import { Brain, Upload, Search, Send, BookOpen, FileText, Lock, Cpu, ChevronRight, Sparkles, X } from 'lucide-react'

const documents = [
  { id: 1, name: 'DBMS Textbook Ch 1-8', pages: 320, indexed: true, size: '4.2 MB', type: 'pdf' },
  { id: 2, name: 'OS Lab Manual', pages: 80, indexed: true, size: '1.1 MB', type: 'pdf' },
  { id: 3, name: 'Data Structures Notes (Handwritten)', pages: 45, indexed: true, size: '8.9 MB', type: 'image' },
  { id: 4, name: 'Compiler Design Slides', pages: 120, indexed: false, size: '2.3 MB', type: 'pdf' },
  { id: 5, name: 'CN Theory Reference', pages: 200, indexed: true, size: '3.1 MB', type: 'pdf' },
]

const suggestQueries = [
  'What is 3NF normalization?',
  'Explain page replacement algorithms',
  'Difference between process and thread',
  'How does heap sort work?',
  'TCP vs UDP — key differences',
  'What is semantic analysis in compilers?',
]

const sampleChunks = [
  { doc: 'DBMS Textbook Ch 1-8', page: 187, snippet: 'A relation is in Third Normal Form (3NF) if it is in 2NF and no non-prime attribute is transitively dependent on any key...' },
  { doc: 'DBMS Textbook Ch 1-8', page: 189, snippet: 'To decompose into 3NF: identify all functional dependencies, find a minimal cover, and create relations for each dependency...' },
  { doc: 'OS Lab Manual', page: 12, snippet: 'Normalization ensures data integrity and reduces redundancy. Steps include identifying candidate keys, FDs, and applying decomposition rules...' },
]

function TypingEffect({ text, done, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const i = useRef(0)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i.current + 1))
      i.current++
      if (i.current >= text.length) { clearInterval(t); onDone?.() }
    }, 18)
    return () => clearInterval(t)
  }, [text, done])

  return <span>{done ? text : displayed}<span style={{ opacity: done ? 0 : 1, animation: 'blink 0.8s infinite' }}>|</span></span>
}

const aiAnswer = `
**3NF (Third Normal Form)** is a database normalization step that removes **transitive dependencies**. A relation R is in 3NF if:

1. It is already in **2NF** (no partial dependencies)
2. No non-prime attribute is transitively dependent on any candidate key

**Example:** If we have:
- Student(sid, name, dept_id, dept_name)
- dept_name depends on dept_id (not directly on sid)

This violates 3NF! Decompose into:
- **Student**(sid, name, dept_id)
- **Department**(dept_id, dept_name)

*Source: DBMS Textbook p.187-189 + OS Lab Manual p.12*
`.trim()

export default function SecondBrain() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [docs, setDocs] = useState(documents)
  const [indexing, setIndexing] = useState(null)
  const [showChunks, setShowChunks] = useState(false)
  const msgEndRef = useRef()

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAsk = (q) => {
    const question = q || query
    if (!question.trim()) return
    setQuery('')

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setIsThinking(true)

    setTimeout(() => {
      setIsThinking(false)
      setMessages(prev => [...prev, {
        role: 'ai',
        text: aiAnswer,
        chunks: sampleChunks,
        done: false
      }])
    }, 2200)
  }

  const handleUpload = () => {
    setIndexing('Compiler Design Slides')
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.name === 'Compiler Design Slides' ? { ...d, indexed: true } : d))
      setIndexing(null)
    }, 3000)
  }

  const totalDocs = docs.length
  const indexedDocs = docs.filter(d => d.indexed).length
  const totalPages = docs.reduce((s, d) => s + d.pages, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1 className="page-title">Local-First Second Brain</h1>
        <p className="page-subtitle">Semantic RAG — query your textbooks & notes entirely offline</p>
      </div>

      {/* Privacy banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(0,229,160,0.06)',
        border: '1px solid rgba(0,229,160,0.2)'
      }}>
        <Lock size={16} color="var(--accent-green)" />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-green)' }}>100% Private & Offline.</strong> All embeddings are computed locally using TensorFlow.js. Your data never leaves this device — works in signal-dead zones like college basements.
        </div>
        <Cpu size={14} color="var(--text-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
      </div>

      {/* Stats */}
      <div className="grid-3">
        {[
          { label: 'Documents', value: totalDocs, icon: FileText, variant: 'primary' },
          { label: 'Indexed Pages', value: totalPages, icon: BookOpen, variant: 'success' },
          { label: 'Chunks Indexed', value: `${indexedDocs * 340}`, icon: Brain, variant: 'secondary' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className={`stat-icon ${s.variant}`}><s.icon size={18} /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Chat interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Suggest queries */}
          {messages.length === 0 && (
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--accent-primary)" />
                Ask your Second Brain
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {suggestQueries.map(q => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    id={`suggest-${q.slice(0,20).replace(/\s/g, '-')}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer', textAlign: 'left',
                      fontSize: '0.82rem', color: 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    <Search size={12} />
                    {q}
                    <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column',
              maxHeight: 520, overflow: 'hidden'
            }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.role === 'user' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{
                          maxWidth: '80%', padding: '10px 16px',
                          borderRadius: '16px 16px 4px 16px',
                          background: 'var(--grad-primary)',
                          color: 'white', fontSize: '0.875rem'
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: 'var(--grad-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Sparkles size={14} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '16px 16px 16px 4px',
                            padding: '12px 16px',
                            fontSize: '0.875rem', lineHeight: 1.7,
                            color: 'var(--text-primary)',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {msg.done !== undefined
                              ? <TypingEffect text={msg.text} done={msg.done} onDone={() => {
                                  setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, done: true } : m))
                                }} />
                              : msg.text
                            }
                          </div>
                          {msg.chunks && (
                            <div style={{ marginTop: 8 }}>
                              <button
                                style={{
                                  fontSize: '0.72rem', color: 'var(--accent-primary)',
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  padding: 0
                                }}
                                onClick={() => setShowChunks(s => !s)}
                              >
                                {showChunks ? '▲' : '▼'} {msg.chunks.length} source chunks
                              </button>
                              {showChunks && (
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {msg.chunks.map((c, ci) => (
                                    <div key={ci} style={{
                                      padding: '8px 12px',
                                      borderRadius: 'var(--radius-sm)',
                                      background: 'var(--bg-glass-light)',
                                      border: '1px solid var(--border-subtle)',
                                      fontSize: '0.72rem'
                                    }}>
                                      <div style={{ color: 'var(--accent-primary)', marginBottom: 3 }}>
                                        📄 {c.doc} — p.{c.page}
                                      </div>
                                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>"{c.snippet}"</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isThinking && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: 'var(--grad-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={14} color="white" />
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: 'var(--accent-primary)',
                          animation: `bounce 1s ease ${i * 0.15}s infinite`
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Searching your documents locally...</span>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
                <input
                  id="brain-query-input"
                  className="chat-input"
                  placeholder="Ask anything from your textbooks..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAsk()}
                />
                <button className="btn-primary" style={{ padding: '9px 16px' }} onClick={() => handleAsk()} id="brain-ask-btn">
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Input when empty */}
          {messages.length === 0 && (
            <div className="ai-search-wrap">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Search size={18} color="var(--text-muted)" />
                <textarea
                  id="brain-main-input"
                  className="ai-input"
                  placeholder="Ask anything from your textbooks or notes..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAsk())}
                  rows={2}
                />
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => handleAsk()} id="brain-main-ask-btn">
                  <Send size={15} /> Ask Second Brain
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: document library */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <BookOpen size={14} color="var(--accent-primary)" />
                Document Library
              </span>
              <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '6px 12px' }} onClick={handleUpload} id="upload-doc-btn">
                <Upload size={12} /> Upload
              </button>
            </div>

            {indexing && (
              <div style={{
                padding: '8px 12px', marginBottom: 10,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(108,99,255,0.08)',
                border: '1px solid rgba(108,99,255,0.2)',
                fontSize: '0.75rem', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid var(--accent-primary)',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite', flexShrink: 0
                }} />
                Indexing "{indexing}"...
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.map(doc => (
                <div key={doc.id} style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-glass-light)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: doc.type === 'pdf' ? 'rgba(255,71,87,0.15)' : 'rgba(108,99,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 800,
                    color: doc.type === 'pdf' ? 'var(--accent-red)' : 'var(--accent-primary)',
                    flexShrink: 0,
                    textTransform: 'uppercase'
                  }}>
                    {doc.type}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      {doc.pages}p · {doc.size}
                    </div>
                  </div>
                  <div title={doc.indexed ? 'Indexed' : 'Not indexed'}>
                    {doc.indexed
                      ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green-glow)' }} />
                      : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)' }} />
                    }
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              🟢 Indexed · ⚫ Not indexed
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
