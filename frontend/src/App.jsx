import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ImportProducts from './pages/ImportProducts'
import Fulfillment from './pages/Fulfillment'
import DepopOverview from './pages/DepopOverview'
import Login from './pages/Login'
import './App.css'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [loggedIn, setLoggedIn] = useState(null) // null = checking

  useEffect(() => {
    axios.get('/api/auth/status', { timeout: 4000 })
      .then(res => setLoggedIn(res.data.loggedIn))
      .catch(() => setLoggedIn(false))
  }, [])

  const handleLogout = async () => {
    await axios.post('/api/auth/logout').catch(() => {})
    setLoggedIn(false)
  }

  if (loggedIn === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />
      case 'import': return <ImportProducts />
      case 'fulfillment': return <Fulfillment />
      case 'overview': return <DepopOverview />
      default: return <Dashboard onNavigate={setPage} />
    }
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={page} onNavigate={setPage} onLogout={handleLogout} />
      <div className="main-content">
        <div className="page-inner">
          {renderPage()}
        </div>
      </div>
    </div>
  )
}
