import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import { useAuth } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import AuthConfirm from './pages/AuthConfirm'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Track from './pages/Track'
import Trending from './pages/Trending'
import Saved from './pages/Saved'
import Calculator from './pages/Calculator'
import Settings from './pages/Settings'
import Billing from './pages/Billing'
import Admin from './pages/Admin'
import Supplier from './pages/Supplier'
import { DashboardProvider } from './context/DashboardContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-[#BEF264] border-t-transparent rounded-full animate-spin" />
        <div className="flex flex-col items-center">
          <p className="text-[#111827] text-md font-black tracking-tighter">BOOTING TRENDHAWK OS</p>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">Neural Link Established</p>
        </div>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login mode="login" />} />
      <Route path="/signup" element={<Login mode="signup" />} />
      <Route path="/auth/confirm" element={<AuthConfirm />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardProvider>
              <DashboardLayout />
            </DashboardProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="track" element={<Track />} />
        <Route path="trending" element={<Trending />} />
        <Route path="saved" element={<Saved />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing" element={<Billing />} />
        <Route path="admin" element={<Admin />} />
        <Route path="supplier" element={<Supplier />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
