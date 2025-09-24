import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewRTGS from './pages/NewRTGS'
import Beneficiaries from './pages/Beneficiaries'
import BankDetailsPage from './pages/BankDetailsPage'
import History from './pages/History'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { authService } from './services/authService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = authService.getToken()
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar onMenuClick={() => setSidebarOpen(true)} onLogout={handleLogout} />
        
        <div className="flex pt-16">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          <main className="flex-1 lg:ml-64 transition-all duration-300 min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-rtgs" element={<NewRTGS />} />
              <Route path="/beneficiaries" element={<Beneficiaries />} />
              <Route path="/bank-details" element={<BankDetailsPage />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
