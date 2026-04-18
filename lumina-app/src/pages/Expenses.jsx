import { useState } from 'react'
import { Plus, Trash2, Edit3, TrendingDown, TrendingUp, Coffee, Zap, ShoppingBag, Bus, BookOpen, Utensils, X, Check } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const categoryConfig = {
  Food: { color: '#ff6b9d', icon: Utensils },
  Transport: { color: '#00d4ff', icon: Bus },
  Coffee: { color: '#ff9500', icon: Coffee },
  Study: { color: '#6c63ff', icon: BookOpen },
  Shopping: { color: '#00e5a0', icon: ShoppingBag },
  Misc: { color: '#8892b0', icon: Zap },
}

const initialExpenses = [
  { id: 1, desc: 'Lunch at canteen', amount: 80, category: 'Food', date: 'Apr 18' },
  { id: 2, desc: 'Bus pass refill', amount: 250, category: 'Transport', date: 'Apr 18' },
  { id: 3, desc: 'Chai + samosa', amount: 30, category: 'Coffee', date: 'Apr 17' },
  { id: 4, desc: 'Photocopy notes (50 pages)', amount: 50, category: 'Study', date: 'Apr 17' },
  { id: 5, desc: 'Dinner: Zomato order', amount: 189, category: 'Food', date: 'Apr 16' },
  { id: 6, desc: 'Highlighter pens (3)', amount: 75, category: 'Study', date: 'Apr 15' },
  { id: 7, desc: 'Rickshaw to college', amount: 40, category: 'Transport', date: 'Apr 15' },
  { id: 8, desc: 'Café latte (Starbucks 😬)', amount: 380, category: 'Coffee', date: 'Apr 14' },
  { id: 9, desc: 'Monthly grocery', amount: 650, category: 'Shopping', date: 'Apr 13' },
  { id: 10, desc: 'Print lab report', amount: 25, category: 'Study', date: 'Apr 12' },
]

const weeklyData = [
  { week: 'Wk 1', spent: 1200 },
  { week: 'Wk 2', spent: 980 },
  { week: 'Wk 3', spent: 1540 },
  { week: 'Wk 4', spent: 840 },
]

const BUDGET = 5000

function QuickAdd({ onAdd }) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [open, setOpen] = useState(false)

  const submit = () => {
    if (!desc || !amount) return
    onAdd({ desc, amount: Number(amount), category, date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) })
    setDesc(''); setAmount(''); setOpen(false)
  }

  if (!open) return (
    <button className="btn-primary" onClick={() => setOpen(true)} id="quick-add-open">
      <Plus size={16} /> Log Expense
    </button>
  )

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-glow)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
      animation: 'slide-up 0.3s ease forwards'
    }}>
      <input
        id="expense-desc"
        autoFocus
        placeholder="What did you spend on?"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        style={{
          flex: 2, minWidth: 160, padding: '9px 14px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
          fontSize: '0.875rem', outline: 'none'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
      />
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>₹</span>
        <input
          id="expense-amount"
          type="number"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{
            width: 100, padding: '9px 14px 9px 28px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            fontSize: '0.875rem', outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
        />
      </div>
      <select
        id="expense-category"
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={{
          padding: '9px 14px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
          fontSize: '0.875rem', outline: 'none', cursor: 'pointer'
        }}
      >
        {Object.keys(categoryConfig).map(c => <option key={c}>{c}</option>)}
      </select>
      <button className="btn-primary" style={{ padding: '9px 18px' }} onClick={submit} id="expense-save">
        <Check size={15} /> Save
      </button>
      <button className="btn-ghost" style={{ padding: '9px 14px' }} onClick={() => setOpen(false)} id="expense-cancel">
        <X size={15} />
      </button>
    </div>
  )
}

export default function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses)

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const remaining = BUDGET - total
  const budgetPct = Math.round((total / BUDGET) * 100)

  // Category breakdown
  const catTotals = {}
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount })
  const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }))

  const handleAdd = (exp) => {
    setExpenses(prev => [{ id: Date.now(), ...exp }, ...prev])
  }

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  // Weekly wrap insight
  const biggestCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Expense Logger</h1>
            <p className="page-subtitle">Frictionless spending tracker with weekly wrap</p>
          </div>
          <QuickAdd onAdd={handleAdd} />
        </div>
      </div>

      {/* Budget overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16
      }}>
        <div className={`stat-card ${budgetPct > 80 ? 'danger' : 'success'}`}>
          <div className={`stat-icon ${budgetPct > 80 ? 'danger' : 'success'}`}>
            <TrendingUp size={18} />
          </div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>₹{total.toLocaleString()}</div>
          <div className={`stat-change ${budgetPct > 80 ? 'negative' : 'positive'}`}>
            {budgetPct}% of ₹{BUDGET.toLocaleString()} budget
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><TrendingDown size={18} /></div>
          <div className="stat-label">Remaining</div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>₹{remaining.toLocaleString()}</div>
          <div className="stat-change neutral">{Math.round((remaining / BUDGET) * 100)}% left this month</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><ShoppingBag size={18} /></div>
          <div className="stat-label">Top Category</div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>{biggestCategory?.[0]}</div>
          <div className="stat-change negative">₹{biggestCategory?.[1]} spent</div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
          <span style={{ fontWeight: 600 }}>Monthly Budget</span>
          <span style={{ color: budgetPct > 80 ? 'var(--accent-red)' : 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
            ₹{total} / ₹{BUDGET}
          </span>
        </div>
        <div className="progress-bar-wrap" style={{ height: 10 }}>
          <div
            className={`progress-bar-fill ${budgetPct > 80 ? 'danger' : 'success'}`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {Object.entries(categoryConfig).map(([cat, cfg]) => {
            const amt = catTotals[cat] || 0
            if (!amt) return null
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                <span style={{ color: cfg.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{amt}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts + table */}
      <div className="grid-2" style={{ gap: 20, gridTemplateColumns: '340px 1fr' }}>
        {/* Pie chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontWeight: 700 }}>Category Breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={3}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={categoryConfig[entry.name]?.color || '#8892b0'}
                    stroke="var(--bg-card)" strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: '0.8rem' }}
                formatter={(val) => [`₹${val}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: categoryConfig[d.name]?.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{d.value}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  {Math.round((d.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.875rem' }}>
            Recent Transactions
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 380 }}>
            <table className="exp-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => {
                  const cfg = categoryConfig[e.category]
                  const Icon = cfg?.icon || Zap
                  return (
                    <tr key={e.id} id={`expense-row-${e.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: `${cfg?.color}20`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon size={14} color={cfg?.color} />
                          </div>
                          {e.desc}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 99, background: `${cfg?.color}15`, color: cfg?.color }}>
                          {e.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{e.date}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{e.amount}</span>
                      </td>
                      <td>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                          onClick={() => handleDelete(e.id)}
                          id={`del-expense-${e.id}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Weekly Wrap */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(0,212,255,0.06) 100%)',
        border: '1px solid rgba(108,99,255,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: 24
      }}>
        <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          📊 Weekly Student Wrap
        </div>
        <div className="grid-2" style={{ gap: 20, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              This week you spent <strong style={{ color: 'var(--accent-primary)' }}>₹1,769</strong> — 
              that's <strong style={{ color: 'var(--accent-orange)' }}>12% more</strong> than last week.
              Your biggest splurge was <strong style={{ color: 'var(--accent-tertiary)' }}>a ₹380 Starbucks order 😬</strong>.
              Consider cooking 2 more days this week to save ~₹400.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: '0.78rem' }}
                formatter={(v) => [`₹${v}`, 'Spent']}
              />
              <Bar dataKey="spent" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
