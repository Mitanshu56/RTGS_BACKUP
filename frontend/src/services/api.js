import axios from 'axios'
import { authService } from './authService'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      authService.logout()
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.data?.detail) {
      toast.error(error.response.data.detail)
    } else {
      toast.error('An error occurred')
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
}

// Beneficiary endpoints
export const beneficiaryAPI = {
  getAll: (params = {}) => api.get('/beneficiaries', { params }),
  getById: (id) => api.get(`/beneficiaries/${id}`),
  create: (data) => api.post('/beneficiaries', data),
  update: (id, data) => api.put(`/beneficiaries/${id}`, data),
  delete: (id) => api.delete(`/beneficiaries/${id}`),
  getBankDetailsByIFSC: (ifscCode) => api.get(`/beneficiaries/ifsc/${ifscCode}`),
}

// Transaction endpoints
export const transactionAPI = {
  getAll: (params = {}) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  delete: (id, password) => api.delete(`/transactions/${id}`, { 
    data: { password } 
  }),
  getDashboardStats: () => api.get('/transactions/stats/dashboard'),
}

// PDF endpoints
export const pdfAPI = {
  generate: (transactionId) => api.post(`/pdf/generate/${transactionId}`),
  download: (transactionId) => {
    return api.get(`/pdf/download/${transactionId}`, {
      responseType: 'blob',
    })
  },
}

export default api
