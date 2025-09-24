import { useState, useEffect, useRef } from 'react'
import { Download, Filter, Calendar, DollarSign, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { transactionAPI, beneficiaryAPI, pdfAPI } from '../services/api'
import { authService } from '../services/authService'

const History = () => {
  const [transactions, setTransactions] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [beneficiarySearch, setBeneficiarySearch] = useState('')
  const [showBeneficiaryDropdown, setShowBeneficiaryDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear(),
    beneficiary_id: ''
  })
  const itemsPerPage = 10

  useEffect(() => {
    fetchTransactions()
    fetchBeneficiaries()
  }, [filters])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBeneficiaryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Set initial beneficiary name when filter is set
  useEffect(() => {
    if (filters.beneficiary_id && beneficiaries.length > 0) {
      const selectedBeneficiary = beneficiaries.find(b => b.id.toString() === filters.beneficiary_id.toString())
      if (selectedBeneficiary && beneficiarySearch !== selectedBeneficiary.name) {
        setBeneficiarySearch(selectedBeneficiary.name)
      }
    } else if (!filters.beneficiary_id) {
      setBeneficiarySearch('')
    }
  }, [filters.beneficiary_id, beneficiaries])

  const fetchTransactions = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )
      const response = await transactionAPI.getAll(params)
      setTransactions(response.data.transactions || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getAll()
      setBeneficiaries(response.data)
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error)
    }
  }

  const handleDownload = async (transactionId) => {
    try {
      const response = await pdfAPI.download(transactionId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rtgs_${transactionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction)
    setShowDeleteModal(true)
    setDeletePassword('')
    setShowPassword(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter password')
      return
    }

    setDeleteLoading(true)
    
    try {
      // Get token using authService (same way as global interceptor)
      const token = authService.getToken()
      
      if (!token) {
        toast.error('Authentication required. Please login again.')
        return
      }

      // Make a direct axios call to bypass global error interceptor
      // Create a temporary axios instance without the global interceptor
      const directAPI = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      
      // Make the delete request with exact same format as transactionAPI.delete
      await directAPI.delete(`/transactions/${selectedTransaction.id}`, {
        data: { password: deletePassword }
      })
      
      // SUCCESS: Delete successful - close modal and refresh
      toast.success('Transaction deleted successfully')
      setShowDeleteModal(false)
      setSelectedTransaction(null)
      setDeletePassword('')
      setShowPassword(false)
      fetchTransactions() // Refresh the list
      
    } catch (error) {
      // Handle ALL errors locally to prevent logout
      console.error('Delete error caught locally:', error)
      
      // Clear password for retry
      setDeletePassword('')
      
      // Check if it's an HTTP response error
      if (error?.response?.status) {
        const status = error.response.status
        
        switch (status) {
          case 400:
            toast.error('Invalid request. Please check your input.')
            break
          case 401:
            toast.error('Incorrect password. Please try again.')
            break
          case 403:
            toast.error('Access denied. Incorrect password.')
            break
          case 404:
            toast.error('Transaction not found.')
            break
          case 500:
            toast.error('Server error. Please try again later.')
            break
          default:
            toast.error('Incorrect password. Please try again.')
        }
      } else if (error?.code === 'NETWORK_ERROR' || !error?.response) {
        // Network error
        toast.error('Network error. Please check your connection.')
      } else {
        // Any other error - assume wrong password
        toast.error('Incorrect password. Please try again.')
      }
      
      // Important: Modal stays open, error is handled locally
      // No logout since we bypassed global interceptor
    } finally {
      setDeleteLoading(false)
    }
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedTransaction(null)
    setDeletePassword('')
    setShowPassword(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = transactions.slice(startIndex, endIndex)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // Show 5 page numbers at most
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage + 1 < showPages && startPage > 1) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  // Filter beneficiaries based on search
  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
    beneficiary.account_number.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
    beneficiary.bank_name.toLowerCase().includes(beneficiarySearch.toLowerCase())
  )

  // Handle beneficiary selection
  const handleBeneficiarySelect = (beneficiaryId, beneficiaryName) => {
    setFilters({...filters, beneficiary_id: beneficiaryId})
    setBeneficiarySearch(beneficiaryName)
    setShowBeneficiaryDropdown(false)
  }

  // Clear beneficiary filter
  const clearBeneficiaryFilter = () => {
    setFilters({...filters, beneficiary_id: ''})
    setBeneficiarySearch('')
    setShowBeneficiaryDropdown(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage your RTGS transaction history ({transactions.length} total transactions)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filter Transactions
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="">All Months</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary</label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={beneficiarySearch}
                  onChange={(e) => {
                    setBeneficiarySearch(e.target.value)
                    setShowBeneficiaryDropdown(true)
                    if (e.target.value === '') {
                      setFilters({...filters, beneficiary_id: ''})
                    }
                  }}
                  onFocus={() => setShowBeneficiaryDropdown(true)}
                  className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Search beneficiaries..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                {filters.beneficiary_id && (
                  <button
                    onClick={clearBeneficiaryFilter}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showBeneficiaryDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={clearBeneficiaryFilter}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md"
                    >
                      All Beneficiaries
                    </button>
                  </div>
                  <div className="border-t border-gray-100">
                    {filteredBeneficiaries.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No beneficiaries found
                      </div>
                    ) : (
                      filteredBeneficiaries.map(beneficiary => (
                        <button
                          key={beneficiary.id}
                          onClick={() => handleBeneficiarySelect(beneficiary.id, beneficiary.name)}
                          className={`w-full text-left px-3 py-3 text-sm hover:bg-gray-100 transition-colors duration-150 ${
                            filters.beneficiary_id === beneficiary.id.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-xs font-semibold text-blue-600">
                                {beneficiary.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm leading-5 break-words">
                                {beneficiary.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 leading-4 break-words">
                                <div>{beneficiary.bank_name}</div>
                                <div className="font-mono">{beneficiary.account_number}</div>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {currentTransactions.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, transactions.length)} of {transactions.length} transactions
        </div>
      </div>

      {/* Transactions */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your filters or create a new transaction.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Beneficiary Details
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cheque No.
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.map((transaction, index) => (
                    <tr key={transaction.id} className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(transaction.transaction_date)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-green-600">
                                {transaction.beneficiary?.name?.charAt(0)?.toUpperCase() || 'B'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.beneficiary?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.beneficiary?.bank_name}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400 space-y-1">
                            <div>A/C: {transaction.beneficiary?.account_number}</div>
                            <div>IFSC: {transaction.beneficiary?.ifsc_code}</div>
                            {transaction.beneficiary?.mobile && (
                              <div>Mobile: {transaction.beneficiary?.mobile}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {transaction.cheque_number || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={transaction.purpose}>
                          {transaction.purpose || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={transaction.remarks}>
                          {transaction.remarks || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleDownload(transaction.id)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(transaction)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete Transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {currentTransactions.map((transaction, index) => (
              <div key={transaction.id} className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">
                          {transaction.beneficiary?.name?.charAt(0)?.toUpperCase() || 'B'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {transaction.beneficiary?.name}
                        </h3>
                        <p className="text-sm text-gray-500">{transaction.beneficiary?.bank_name}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                      <div>A/C: {transaction.beneficiary?.account_number} | IFSC: {transaction.beneficiary?.ifsc_code}</div>
                      {transaction.beneficiary?.mobile && (
                        <div>Mobile: {transaction.beneficiary?.mobile}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleDownload(transaction.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(transaction)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      title="Delete Transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block">Amount:</span>
                    <div className="font-bold text-gray-900">{formatCurrency(transaction.amount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Date:</span>
                    <div className="font-medium text-gray-900">{formatDate(transaction.transaction_date)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Cheque No.:</span>
                    <div className="font-mono text-gray-900">{transaction.cheque_number || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Purpose:</span>
                    <div className="font-medium text-gray-900 truncate" title={transaction.purpose}>
                      {transaction.purpose || '-'}
                    </div>
                  </div>
                </div>
                
                {transaction.remarks && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-500 block">Remarks:</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {transaction.remarks}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of{' '}
                  {transactions.length} transactions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        currentPage === page
                          ? 'text-blue-600 bg-blue-50 border border-blue-300'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Transaction</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTransaction(null);
                  setDeletePassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to delete this transaction?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  {selectedTransaction.beneficiary?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Amount: {formatCurrency(selectedTransaction.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {formatDate(selectedTransaction.transaction_date)}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter password to confirm deletion
              </label>
              <div className="relative">
                <input
                  id="delete-password"
                  type={showPassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTransaction(null);
                  setDeletePassword('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                disabled={!deletePassword.trim() || deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History
