import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Timetable from './pages/Timetable'
import ContextSwitch from './pages/ContextSwitch'
import GroupHub from './pages/GroupHub'
import CalendarEmail from './pages/CalendarEmail'
import Kanban from './pages/Kanban'
import Expenses from './pages/Expenses'
import SecondBrain from './pages/SecondBrain'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="focus" element={<ContextSwitch />} />
          <Route path="hub" element={<GroupHub />} />
          <Route path="calendar" element={<CalendarEmail />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="brain" element={<SecondBrain />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
