import { NavLink, useLocation } from 'react-router-dom'
import { X, Home, Plus, Users, History, FileText, CreditCard } from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'New RTGS', href: '/new-rtgs', icon: Plus },
    { name: 'Beneficiaries', href: '/beneficiaries', icon: Users },
    { name: 'Bank Details', href: '/bank-details', icon: CreditCard },
    { name: 'History', href: '/history', icon: History },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-60 lg:hidden z-30 transition-all duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white/98 backdrop-blur-sm shadow-2xl border-r border-gray-100 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 lg:hidden mt-16">
          <span className="text-lg font-bold text-primary-700 tracking-tight">Menu</span>
          <button
            onClick={onClose}
            className="btn btn-secondary p-2 !px-2 !py-2"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 mt-8 lg:mt-20 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={`
                  group flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-xl transition-all duration-150
                  ${isActive 
                    ? 'bg-primary-100 text-primary-700 shadow border-l-4 border-primary-600' 
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                  }
                `}
              >
                <Icon className={`
                  h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-600'}
                `} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto p-6 border-t border-gray-100 text-center">
          <div className="text-xs text-gray-400 font-medium tracking-wide">
            © 2024 RTGS Automation
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
