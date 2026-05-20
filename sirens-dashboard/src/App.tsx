import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import TopNav from './components/layout/TopNav'
import MapPage from './pages/MapPage';
import OverviewPage from './pages/OverviewPage'
import CrisisPage from './pages/CrisisPage'
import AgentTerminalPage from './pages/AgentTerminalPage'
import SOSPage from './pages/SOSPage'
import AlertsPage from './pages/AlertsPage'
import IncidentsPage from './pages/IncidentsPage'
import AgentsPage from './pages/AgentsPage'
import LoginPage from './pages/LoginPage'           // ← new
import { AuthProvider, useAuth } from './context/AuthContext' // ← new
import { useCrises, useSOSSignals } from './hooks/userFirestore'
import type { Page } from './types'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuth()              // ← new
  const { crises } = useCrises()
  const { signals } = useSOSSignals()

  const pathMap: Record<string, Page> = {
    '/': 'overview',
    '/crisis': 'crises',
    '/map': 'map',
    '/sos': 'sos',
    '/alerts': 'alerts',
    '/incidents': 'incidents',
    '/agents': 'agents',
    '/terminal': 'terminal',
  }

  const currentPage = pathMap[location.pathname] || 'overview'

  const handleNavigate = (page: Page) => {
    const path = page === 'overview' ? '/' : `/${page === 'crises' ? 'crisis' : page}`
    navigate(path)
  }

  if (loading) return (                            // ← new: wait for auth state
    <div style={{ minHeight: '100vh', background: '#070C1E', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#fff', letterSpacing: 3 }}>
      LOADING…
    </div>
  )

  if (!user) return <LoginPage />                  // ← new: gate everything behind login

  return (
    <div className="flex h-screen bg-[#070C1E] text-white">
      <Sidebar
        current={currentPage}
        onNavigate={handleNavigate}
        crisisCount={crises.length}
        sosCount={signals.filter(s => s.status === 'pending').length}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/crisis" element={<CrisisPage />} />
            <Route path="/terminal" element={<AgentTerminalPage />} />
            <Route path="/sos" element={<SOSPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
<Route path="/map" element={<MapPage />} />          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>                                 {/* ← new */}
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App