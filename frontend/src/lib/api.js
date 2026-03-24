import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_URL })

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Scraping
export const scrapeProduct = (url, platform) =>
  api.post('/api/scrape', { url, platform }).then(r => r.data)

export const searchProducts = (keyword, platform = 'etsy') =>
  api.post('/api/search', { keyword, platform }).then(r => r.data)

// Usage & User
export const getUsage = () => api.get('/api/usage').then(r => r.data)
export const getUser = () => api.get('/api/user').then(r => r.data)
export const updateUser = (data) => api.patch('/api/user', data).then(r => r.data)

// Tracked Products
export const getTracked = () => api.get('/api/tracked').then(r => r.data)
export const addTracked = (productData) => api.post('/api/tracked', { productData }).then(r => r.data)
export const deleteTracked = (id) => api.delete(`/api/tracked/${id}`).then(r => r.data)

// Saved Products
export const getSaved = () => api.get('/api/saved').then(r => r.data)
export const addSaved = (data) => api.post('/api/saved', data).then(r => r.data)
export const deleteSaved = (id) => api.delete(`/api/saved/${id}`).then(r => r.data)

// Alerts
export const getAlerts = () => api.get('/api/alerts').then(r => r.data)
export const createAlert = (data) => api.post('/api/alerts', data).then(r => r.data)
export const deleteAlert = (id) => api.delete(`/api/alerts/${id}`).then(r => r.data)

// Trending
export const getTrending = (platform = 'all', limit = 20) =>
  api.get(`/api/trending?platform=${platform}&limit=${limit}`).then(r => r.data)

// Price History (Pro+)
export const getPriceHistory = (productId) =>
  api.get(`/api/price-history/${productId}`).then(r => r.data)

// Calculator Presets (Basic+)
export const getPresets = () => api.get('/api/calculator/presets').then(r => r.data)
export const createPreset = (data) => api.post('/api/calculator/presets', data).then(r => r.data)
export const deletePreset = (id) => api.delete(`/api/calculator/presets/${id}`).then(r => r.data)

// Plans
export const getPlans = () => api.get('/api/plans').then(r => r.data)

// Admin
export const adminGetUsers = () => api.get('/api/admin/users').then(r => r.data)
export const adminUpdatePlan = (userId, plan) => api.patch(`/api/admin/users/${userId}/plan`, { plan }).then(r => r.data)
export const adminUpdateCredits = (userId, credits) => api.patch(`/api/admin/users/${userId}/credits`, { credits }).then(r => r.data)
export const adminToggleAdmin = (userId, is_admin) => api.patch(`/api/admin/users/${userId}/admin`, { is_admin }).then(r => r.data)
export const adminRefreshCache = () => api.post('/api/admin/cache/refresh').then(r => r.data)
export const adminGetStats = () => api.get('/api/admin/stats').then(r => r.data)

// Batched Dashboard Data
export const getDashboardSummary = () => api.get('/api/dashboard/summary').then(r => r.data)

export default api
