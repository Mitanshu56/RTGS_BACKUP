const TOKEN_KEY = 'rtgs_auth_token'
const USER_KEY = 'rtgs_user'

export const authService = {
  // Store token
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  // Store user data
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Get user data
  getUser: () => {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authService.getToken()
    return !!token
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // Clear all auth data
  clear: () => {
    localStorage.clear()
  },
}
