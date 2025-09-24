import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  CreditCard, 
  Users, 
  FileText, 
  TrendingUp,
  ArrowRight,
  DollarSign,
  Calendar,
  Plus,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Wallet,
  Target,
  Activity,
  Sparkles
} from 'lucide-react'

import { transactionAPI } from '../services/api'
import { authService } from '../services/authService'

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_transactions: 0,
    total_amount: 0,
    monthly_transactions: 0,
    active_beneficiaries: 0
  })
  const [loading, setLoading] = useState(true)
  const [bankDetailsSetup, setBankDetailsSetup] = useState(false)
  const [checkingBankDetails, setCheckingBankDetails] = useState(true)
  
  const user = authService.getUser()

  useEffect(() => {
    fetchDashboardStats()
    checkBankDetails()
  }, [])

  const checkBankDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/remitter/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      setBankDetailsSetup(response.ok)
    } catch (error) {
      console.error('Error checking bank details:', error)
      setBankDetailsSetup(false)
    } finally {
      setCheckingBankDetails(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await transactionAPI.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const statCards = [
    {
      title: 'Total Transactions',
      value: stats.total_transactions,
      icon: Activity,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      bgGradient: 'from-blue-50 via-blue-100 to-blue-50',
      textColor: 'text-blue-800',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats.total_amount),
      icon: Wallet,
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      bgGradient: 'from-emerald-50 via-emerald-100 to-emerald-50',
      textColor: 'text-emerald-800',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      change: '+8%',
      changeColor: 'text-green-600'
    },
    {
      title: 'This Month',
      value: stats.monthly_transactions,
      icon: TrendingUp,
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      bgGradient: 'from-purple-50 via-purple-100 to-purple-50',
      textColor: 'text-purple-800',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      change: '+23%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Active Beneficiaries',
      value: stats.active_beneficiaries,
      icon: Target,
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
      bgGradient: 'from-orange-50 via-orange-100 to-orange-50',
      textColor: 'text-orange-800',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      change: '+5%',
      changeColor: 'text-green-600'
    }
  ]

  const quickActions = [
    {
      title: 'New RTGS Transfer',
      description: 'Create a new RTGS transfer with smart automation',
      href: '/new-rtgs',
      icon: CreditCard,
      gradient: 'from-indigo-500 via-indigo-600 to-indigo-700',
      bgGradient: 'from-indigo-50 via-white to-indigo-50',
      hoverShadow: 'hover:shadow-indigo-500/25'
    },
    {
      title: 'Manage Beneficiaries',
      description: 'Add, edit and organize beneficiary profiles',
      href: '/beneficiaries',
      icon: Users,
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      bgGradient: 'from-emerald-50 via-white to-emerald-50',
      hoverShadow: 'hover:shadow-emerald-500/25'
    },
    {
      title: 'Transaction History',
      description: 'View detailed reports and analytics',
      href: '/history',
      icon: FileText,
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      bgGradient: 'from-purple-50 via-white to-purple-50',
      hoverShadow: 'hover:shadow-purple-500/25'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 mb-4">
                <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Welcome back</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Hello, {user?.name || 'User'}!
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                Manage your RTGS transactions with powerful automation, detailed analytics, 
                and seamless beneficiary management all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/new-rtgs"
                  className="group inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Create New Transfer
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </Link>
                
                <Link
                  to="/history"
                  className="group inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details Notification */}
        {!checkingBankDetails && (
          <div className="mb-8">
            <div className={`relative overflow-hidden rounded-2xl border ${
              bankDetailsSetup 
                ? 'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-emerald-200/50' 
                : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-200/50'
            } shadow-sm`}>
              <div className="absolute inset-0 bg-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      bankDetailsSetup 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                        : 'bg-gradient-to-br from-amber-500 to-yellow-600'
                    } shadow-lg`}>
                      {bankDetailsSetup ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className={`text-lg font-bold ${
                      bankDetailsSetup ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      {bankDetailsSetup ? 'Bank Details Configured ✓' : 'Complete Your Setup'}
                    </h3>
                    <p className={`text-sm ${
                      bankDetailsSetup ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {bankDetailsSetup 
                        ? 'Your bank details are configured and ready for automated PDF generation.' 
                        : 'Configure your bank details to enable automatic PDF inclusion in transfers.'
                      }
                    </p>
                  </div>
                  {!bankDetailsSetup && (
                    <div className="ml-4">
                      <Link
                        to="/bank-details"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-amber-700 hover:to-yellow-700 transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Setup Now
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Transaction Overview
            </h2>
            <div className="text-sm text-gray-500">
              Updated just now
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.title}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-white/40"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full bg-white/50 ${stat.changeColor}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {stat.title}
                      </dt>
                      <dd className={`text-2xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform duration-200`}>
                        {stat.value}
                      </dd>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quick Actions
            </h2>
            <p className="text-gray-600">
              Access key features with a single click
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.bgGradient} border border-white/50 shadow-lg ${action.hoverShadow} hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-white/60"></div>
                  <div className="relative p-8">
                    <div className="text-center">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        {action.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {action.description}
                      </p>
                      
                      <div className="inline-flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
                        <span>Get started</span>
                        <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-indigo-300/50 transition-all duration-300"></div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
