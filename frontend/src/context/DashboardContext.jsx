import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getDashboardSummary } from '../lib/api'
import { useAuth } from './AuthContext'

const DashboardContext = createContext({
  usage: null,
  tracked: [],
  trending: [],
  loading: true,
  error: null,
  refresh: () => {},
})

export function DashboardProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState({
    usage: null,
    tracked: [],
    trending: [],
    loading: true,
    error: null,
  })

  const refresh = useCallback(async (showLoading = false) => {
    if (!user) return
    
    if (showLoading) setData(prev => ({ ...prev, loading: true }))
    
    try {
      const summary = await getDashboardSummary()
      setData({
        usage: summary.usage,
        tracked: summary.tracked,
        trending: summary.trending,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('[DashboardContext] ❌ Refresh failed:', err)
      setData(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }, [user])

  useEffect(() => {
    if (user) {
      refresh()
    } else {
      setData({
        usage: null,
        tracked: [],
        trending: [],
        loading: false,
        error: null,
      })
    }
  }, [user, refresh])

  return (
    <DashboardContext.Provider value={{ ...data, refresh }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => useContext(DashboardContext)
