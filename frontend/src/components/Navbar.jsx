import { Menu, LogOut, User } from 'lucide-react'
import { authService } from '../services/authService'

const Navbar = ({ onMenuClick, onLogout }) => {
  const user = authService.getUser()

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden btn btn-secondary p-2 !px-2 !py-2"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-2 text-2xl font-bold tracking-tight text-primary-700 select-none">
            RTGS <span className="text-primary-500">Automation</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full shadow-sm">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-sm font-semibold text-primary-700">
              {user?.name || 'User'}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-secondary p-2 !px-2 !py-2"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
