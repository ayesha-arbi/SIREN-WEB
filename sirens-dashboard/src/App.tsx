import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import TopNav from './components/layout/TopNav'

import OverviewPage from './pages/OverviewPage'
import CrisisPage from './pages/CrisisPage'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#070C1E] text-white">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top Navigation */}
          <TopNav />

          {/* Pages */}
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/crisis" element={<CrisisPage />} />
            </Routes>
          </main>

        </div>
      </div>
    </BrowserRouter>
  )
}

export default App