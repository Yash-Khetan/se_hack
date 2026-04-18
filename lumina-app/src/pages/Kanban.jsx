import { useState } from 'react'
import { Plus, X, GripVertical, Clock, User, Tag, ChevronDown } from 'lucide-react'

const initialTasks = {
  backlog: [
    { id: 't1', title: 'Research sorting algorithm variants', priority: 'low', tag: 'DS Assignment', assignee: 'R', due: 'Apr 25' },
    { id: 't2', title: 'Read Chapter 8 — Transaction Management', priority: 'medium', tag: 'DBMS', assignee: 'Y', due: 'Apr 22' },
    { id: 't3', title: 'Watch OS scheduling lecture (YouTube)', priority: 'low', tag: 'OS', assignee: 'R', due: 'Apr 30' },
  ],
  doing: [
    { id: 't4', title: 'Write normalization report (2NF → 3NF)', priority: 'high', tag: 'DBMS', assignee: 'R', due: 'Apr 18' },
    { id: 't5', title: 'Prepare ER diagram for Student DB', priority: 'high', tag: 'DBMS', assignee: 'P', due: 'Apr 18' },
    { id: 't6', title: 'Fix memory leak in OS lab code', priority: 'medium', tag: 'OS Lab', assignee: 'A', due: 'Apr 19' },
  ],
  review: [
    { id: 't7', title: 'Peer review Yash\'s DS assignment', priority: 'medium', tag: 'DS Assignment', assignee: 'R', due: 'Apr 20' },
  ],
  done: [
    { id: 't8', title: 'Set up GitHub repo for project', priority: 'low', tag: 'Project', assignee: 'A', due: 'Apr 15' },
    { id: 't9', title: 'Install Oracle DB + test queries', priority: 'medium', tag: 'DBMS', assignee: 'S', due: 'Apr 14' },
    { id: 't10', title: 'Submit CN theory assignment', priority: 'high', tag: 'CN', assignee: 'R', due: 'Apr 12' },
  ],
}

const columns = [
  { id: 'backlog', label: 'Backlog', color: 'var(--text-muted)', emoji: '📋' },
  { id: 'doing', label: 'Doing', color: 'var(--accent-primary)', emoji: '⚡' },
  { id: 'review', label: 'In Review', color: 'var(--accent-orange)', emoji: '👀' },
  { id: 'done', label: 'Done', color: 'var(--accent-green)', emoji: '✅' },
]

const priorityColors = {
  high: 'var(--accent-red)',
  medium: 'var(--accent-orange)',
  low: 'var(--accent-green)',
}

const avatarColors = {
  R: 'var(--grad-primary)',
  Y: 'linear-gradient(135deg, #ff6b9d, #6c63ff)',
  P: 'linear-gradient(135deg, #00d4ff, #6c63ff)',
  A: 'linear-gradient(135deg, #00e5a0, #00d4ff)',
  S: 'linear-gradient(135deg, #ff9500, #ff6b9d)',
}

function TaskCard({ task, colId, onMove, onDelete }) {
  const [showMove, setShowMove] = useState(false)

  return (
    <div
      className="kanban-card"
      id={`task-${task.id}`}
      style={{ position: 'relative' }}
    >
      {/* Priority indicator */}
      <div style={{
        width: '100%', height: 2,
        background: priorityColors[task.priority],
        borderRadius: '2px 2px 0 0',
        position: 'absolute', top: -1, left: 0
      }} />

      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
        <GripVertical size={12} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div className="kanban-card-title" style={{ flex: 1 }}>{task.title}</div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
          onClick={() => onDelete(colId, task.id)}
          id={`delete-${task.id}`}
        >
          <X size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="tag" style={{ fontSize: '0.65rem', color: 'var(--accent-primary)' }}>{task.tag}</span>
        <span className="badge" style={{
          fontSize: '0.6rem', padding: '2px 7px',
          background: `${priorityColors[task.priority]}15`,
          color: priorityColors[task.priority],
          border: `1px solid ${priorityColors[task.priority]}40`
        }}>
          {task.priority}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{task.due}</span>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: avatarColors[task.assignee] || 'var(--grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700, color: 'white'
          }}>{task.assignee}</div>
        </div>
      </div>

      {/* Move dropdown */}
      <div style={{ marginTop: 8 }}>
        <button
          style={{
            width: '100%', padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-glass-light)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.68rem', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
          }}
          onClick={() => setShowMove(s => !s)}
          id={`move-btn-${task.id}`}
        >
          Move to <ChevronDown size={10} />
        </button>
        {showMove && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            zIndex: 10, overflow: 'hidden',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            {columns.filter(c => c.id !== colId).map(col => (
              <button key={col.id}
                style={{
                  display: 'block', width: '100%', padding: '8px 12px',
                  fontSize: '0.75rem', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                onClick={() => { onMove(colId, col.id, task.id); setShowMove(false) }}
                id={`move-to-${col.id}-${task.id}`}
              >
                {col.emoji} {col.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Kanban() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState('')
  const [addingTo, setAddingTo] = useState(null)

  const moveTask = (fromCol, toCol, taskId) => {
    const task = tasks[fromCol].find(t => t.id === taskId)
    setTasks(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
      [toCol]: [task, ...prev[toCol]]
    }))
  }

  const deleteTask = (colId, taskId) => {
    setTasks(prev => ({ ...prev, [colId]: prev[colId].filter(t => t.id !== taskId) }))
  }

  const addTask = (colId) => {
    if (!newTask.trim()) { setAddingTo(null); return }
    const task = {
      id: `t${Date.now()}`,
      title: newTask.trim(),
      priority: 'medium',
      tag: 'General',
      assignee: 'R',
      due: 'TBD'
    }
    setTasks(prev => ({ ...prev, [colId]: [task, ...prev[colId]] }))
    setNewTask('')
    setAddingTo(null)
  }

  const totalCount = Object.values(tasks).flat().length
  const doneCount = tasks.done.length
  const progress = Math.round((doneCount / totalCount) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Multi-User Kanban Board</h1>
            <p className="page-subtitle">Shared task board for team project alignment</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setAddingTo('backlog')}
            id="add-task-btn"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Sprint Progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-green)' }}>
              {doneCount}/{totalCount} tasks · {progress}%
            </span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill success" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: -6 }}>
          {['R','Y','P','A','S'].map(a => (
            <div key={a} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: avatarColors[a],
              border: '2px solid var(--bg-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, color: 'white',
              marginLeft: a !== 'R' ? -8 : 0
            }}>{a}</div>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.id} className="kanban-column" style={{ minWidth: 280 }}>
            <div className="kanban-col-header">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
              <span className="kanban-col-title">{col.emoji} {col.label}</span>
              <span className="kanban-col-count">{tasks[col.id].length}</span>
            </div>

            {/* Add task input */}
            {addingTo === col.id && (
              <div style={{ marginBottom: 8 }}>
                <input
                  id={`new-task-input-${col.id}`}
                  autoFocus
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTask(col.id); if (e.key === 'Escape') setAddingTo(null) }}
                  placeholder="Task name... (Enter to save)"
                  style={{
                    width: '100%', padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glow)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            {/* Tasks */}
            {tasks[col.id].map(task => (
              <TaskCard
                key={task.id}
                task={task}
                colId={col.id}
                onMove={moveTask}
                onDelete={deleteTask}
              />
            ))}

            {/* Add button */}
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', width: '100%',
                fontSize: '0.78rem', color: 'var(--text-muted)',
                background: 'none', border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: 4
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              onClick={() => setAddingTo(col.id)}
              id={`add-to-${col.id}`}
            >
              <Plus size={12} /> Add task
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
