import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Building2, ChevronLeft, ChevronRight, Search, ChevronDown, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { beneficiaryAPI } from '../services/api'

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState(null)
  const [fetchingBankDetails, setFetchingBankDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const itemsPerPage = 10

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm()

  useEffect(() => {
    fetchBeneficiaries()
  }, [])

  // Filter and search functionality
  useEffect(() => {
    let filtered = beneficiaries
    if (searchTerm.trim()) {
      filtered = beneficiaries.filter(
        beneficiary =>
          beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          beneficiary.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          beneficiary.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          beneficiary.ifsc_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (beneficiary.mobile && beneficiary.mobile.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    setFilteredBeneficiaries(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [beneficiaries, searchTerm])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getAll()
      setBeneficiaries(response.data)
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBankDetailsByIFSC = async (ifscCode) => {
    if (!ifscCode || ifscCode.length !== 11) return
    
    setFetchingBankDetails(true)
    try {
      const response = await beneficiaryAPI.getBankDetailsByIFSC(ifscCode)
      const bankData = response.data
      
      setValue('bank_name', bankData.bank_name)
      setValue('branch_name', bankData.branch_name)
      setValue('bank_address', bankData.bank_address)
      
      toast.success('Bank details fetched successfully')
    } catch (error) {
      console.error('Failed to fetch bank details:', error)
      toast.error('Unable to fetch bank details for this IFSC code')
      setValue('bank_name', '')
      setValue('branch_name', '')
      setValue('bank_address', '')
    } finally {
      setFetchingBankDetails(false)
    }
  }

  const watchedIFSC = watch('ifsc_code')
  useEffect(() => {
    if (watchedIFSC && watchedIFSC.length === 11 && !editingBeneficiary) {
      fetchBankDetailsByIFSC(watchedIFSC.toUpperCase())
    }
  }, [watchedIFSC, editingBeneficiary])

  const onSubmit = async (data) => {
    try {
      const cleanedData = {
        ...data,
        mobile: data.mobile && data.mobile.trim() !== '' ? data.mobile.trim() : null,
        bank_address: data.bank_address && data.bank_address.trim() !== '' ? data.bank_address.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        address: data.address && data.address.trim() !== '' ? data.address.trim() : null
      }
      
      if (editingBeneficiary) {
        await beneficiaryAPI.update(editingBeneficiary.id, cleanedData)
        toast.success('Beneficiary updated successfully')
      } else {
        await beneficiaryAPI.create(cleanedData)
        toast.success('Beneficiary created successfully')
      }
      
      setShowModal(false)
      setEditingBeneficiary(null)
      reset()
      fetchBeneficiaries()
    } catch (error) {
      console.error('Failed to save beneficiary:', error)
    }
  }

  const handleEdit = (beneficiary) => {
    setEditingBeneficiary(beneficiary)
    reset(beneficiary)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this beneficiary?')) {
      try {
        await beneficiaryAPI.delete(id)
        toast.success('Beneficiary deleted successfully')
        fetchBeneficiaries()
      } catch (error) {
        console.error('Failed to delete beneficiary:', error)
      }
    }
  }

  const openModal = () => {
    setEditingBeneficiary(null)
    reset()
    setShowModal(true)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setShowDropdown(false)
  }

  const selectBeneficiaryFromDropdown = (beneficiary) => {
    setSearchTerm(beneficiary.name)
    setShowDropdown(false)
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const dropdownBeneficiaries = filteredBeneficiaries

  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBeneficiaries = filteredBeneficiaries.slice(startIndex, endIndex)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const showPages = 5
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficiaries Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your RTGS beneficiary list with professional interface
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <button
            onClick={openModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Beneficiary
          </button>
        </div>
      </div>

      {/* Search Bar with Dropdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative max-w-md" ref={dropdownRef}>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Search by name, account, bank, IFSC, or mobile..."
              />
              {searchTerm && (
                <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button onClick={toggleDropdown} className="flex items-center px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              {dropdownBeneficiaries.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No beneficiaries available</div>
              ) : (
                dropdownBeneficiaries.map((beneficiary) => (
                  <button key={beneficiary.id} onClick={() => selectBeneficiaryFromDropdown(beneficiary)} className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {beneficiary.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 break-words leading-tight">{beneficiary.name}</div>
                        <div className="text-xs text-gray-500 break-words mt-1">Account: {beneficiary.account_number}</div>
                        <div className="text-xs text-gray-500 break-words">Bank: {beneficiary.bank_name}</div>
                        {beneficiary.ifsc_code && <div className="text-xs text-gray-400 break-words">IFSC: {beneficiary.ifsc_code}</div>}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Found {filteredBeneficiaries.length} beneficiaries
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBeneficiaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{searchTerm ? 'No results found' : 'No beneficiaries'}</h3>
            <p className="mt-2 text-sm text-gray-500">{searchTerm ? 'Try adjusting your search terms or clear the search.' : 'Get started by adding a new beneficiary.'}</p>
            <div className="mt-6">
              {searchTerm ? (
                <button onClick={() => setSearchTerm('')} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Clear Search
                </button>
              ) : (
                <button onClick={openModal} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Beneficiary
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:block bg-gray-50 border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Account Number</div>
                <div className="col-span-3">Bank Details</div>
                <div className="col-span-2">IFSC & Branch</div>
                <div className="col-span-1">Contact</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {currentBeneficiaries.map((beneficiary) => (
              <div key={beneficiary.id}>
                {/* Desktop View: Table Row - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50">
                  <div className="col-span-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-sm font-semibold text-blue-600">{beneficiary.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-3 min-w-0 flex-1"><div className="text-sm font-medium text-gray-900 break-words leading-5" title={beneficiary.name}>{beneficiary.name}</div></div>
                    </div>
                  </div>
                  <div className="col-span-2"><div className="text-sm text-gray-900 font-mono break-all">{beneficiary.account_number}</div></div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-900 break-words leading-5" title={beneficiary.bank_name}>{beneficiary.bank_name}</div>
                    {beneficiary.bank_address && <div className="text-xs text-gray-500 break-words mt-1 leading-4" title={beneficiary.bank_address}>{beneficiary.bank_address.split(',')[0]}</div>}
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-mono text-gray-900">{beneficiary.ifsc_code}</div>
                    <div className="text-xs text-gray-500 break-words mt-1 leading-4" title={beneficiary.branch_name}>{beneficiary.branch_name}</div>
                  </div>
                  <div className="col-span-1">
                    {beneficiary.mobile ? <div className="text-sm text-gray-900 font-mono break-all">{beneficiary.mobile}</div> : <div className="text-sm text-gray-400">-</div>}
                    {beneficiary.email && <div className="text-xs text-gray-500 break-all mt-1">{beneficiary.email}</div>}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center justify-center space-x-1">
                      <button onClick={() => handleEdit(beneficiary)} className="inline-flex items-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit beneficiary"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(beneficiary.id)} className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete beneficiary"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>

                {/* Mobile View: Card - Hidden on desktop */}
                <div className="md:hidden p-4 space-y-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-sm font-semibold text-blue-600">{beneficiary.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-3 min-w-0 flex-1"><div className="text-sm font-medium text-gray-900 break-words leading-5" title={beneficiary.name}>{beneficiary.name}</div></div>
                    </div>
                    <div className="flex items-center justify-center space-x-1 flex-shrink-0 ml-4">
                      <button onClick={() => handleEdit(beneficiary)} className="inline-flex items-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit beneficiary"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(beneficiary.id)} className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete beneficiary"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="pl-11 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500">Account Number</div>
                      <div className="font-mono text-gray-900 break-all">{beneficiary.account_number}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500">Bank</div>
                      <div className="font-medium text-gray-900">{beneficiary.bank_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">IFSC</div>
                      <div className="font-mono text-gray-900">{beneficiary.ifsc_code}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Branch</div>
                      <div className="text-gray-600">{beneficiary.branch_name}</div>
                    </div>
                    {beneficiary.mobile && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Contact</div>
                        <div className="font-mono text-gray-900 break-all">{beneficiary.mobile}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBeneficiaries.length)} of {filteredBeneficiaries.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {getPageNumbers().map((page) => (
                    <button key={page} onClick={() => goToPage(page)} className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg ${currentPage === page ? 'text-blue-600 bg-blue-50 border border-blue-300' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">{editingBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}</h3>
              <p className="mt-1 text-sm text-gray-600">{editingBeneficiary ? 'Update beneficiary information' : 'Enter new beneficiary details'}</p>
            </div>
            
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center"><div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input {...register('name', { required: 'Name is required' })} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter full name" />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                      <input {...register('mobile')} type="tel" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter mobile number" maxLength="10" pattern="[6-9][0-9]{9}" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center"><div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>Banking Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                      <input {...register('account_number', { required: 'Account number is required' })} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono" placeholder="Enter account number" />
                      {errors.account_number && <p className="mt-1 text-sm text-red-600">{errors.account_number.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                      <div className="relative">
                        <input {...register('ifsc_code', { required: 'IFSC code is required', pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format' }})} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase" placeholder="Enter IFSC code" style={{ textTransform: 'uppercase' }} onInput={(e) => e.target.value = e.target.value.toUpperCase()} />
                        {fetchingBankDetails && <div className="absolute right-3 top-3"><div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div></div>}
                      </div>
                      {errors.ifsc_code && <p className="mt-1 text-sm text-red-600">{errors.ifsc_code.message}</p>}
                      <p className="mt-1 text-xs text-gray-500">Auto-fills bank details when valid IFSC is entered</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                      <input {...register('bank_name', { required: 'Bank name is required' })} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Auto-filled from IFSC" readOnly={fetchingBankDetails} />
                      {errors.bank_name && <p className="mt-1 text-sm text-red-600">{errors.bank_name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name *</label>
                      <input {...register('branch_name', { required: 'Branch name is required' })} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Auto-filled from IFSC" readOnly={fetchingBankDetails} />
                      {errors.branch_name && <p className="mt-1 text-sm text-red-600">{errors.branch_name.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Address</label>
                      <textarea {...register('bank_address')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="3" placeholder="Auto-filled from IFSC" readOnly={fetchingBankDetails} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button type="button" onClick={() => { setShowModal(false); setEditingBeneficiary(null); reset(); }} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">{editingBeneficiary ? 'Update Beneficiary' : 'Create Beneficiary'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Beneficiaries