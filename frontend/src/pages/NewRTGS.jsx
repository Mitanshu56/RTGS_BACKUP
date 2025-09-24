import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, DollarSign, Calendar, FileText, Search, X, ChevronDown } from 'lucide-react'

import { beneficiaryAPI, transactionAPI, pdfAPI } from '../services/api'
import { IndianRupee } from 'lucide-react'
const NewRTGS = () => {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showNewBeneficiary, setShowNewBeneficiary] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm()

  useEffect(() => {
    fetchBeneficiaries()
  }, [])

  // Close dropdown when clicking outside
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
      setFilteredBeneficiaries(response.data)
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredBeneficiaries(beneficiaries)
    } else {
      const filtered = beneficiaries.filter(beneficiary => 
        beneficiary.name.toLowerCase().includes(term.toLowerCase()) ||
        beneficiary.bank_name.toLowerCase().includes(term.toLowerCase()) ||
        beneficiary.account_number.includes(term) ||
        beneficiary.ifsc_code.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredBeneficiaries(filtered)
    }
    setShowDropdown(true)
  }

  const selectBeneficiary = (beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    setValue('beneficiary_id', beneficiary.id)
    setSearchTerm(`${beneficiary.name} - ${beneficiary.bank_name}`)
    setShowDropdown(false)
  }

  const clearSelection = () => {
    setSelectedBeneficiary(null)
    setValue('beneficiary_id', '')
    setSearchTerm('')
    setFilteredBeneficiaries(beneficiaries)
    setShowDropdown(false)
  }

  const showAllBeneficiaries = () => {
    setFilteredBeneficiaries(beneficiaries)
    setShowDropdown(true)
    setSearchTerm('')
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await transactionAPI.create({
        ...data,
        transaction_date: new Date(data.transaction_date).toISOString()
      })
      
      toast.success('Transaction created successfully!')
      
      // Generate PDF and open print dialog
      setPdfLoading(true)
      try {
        const pdfResponse = await pdfAPI.generate(response.data.id)
        
        // Create blob from PDF data
        const blob = new Blob([pdfResponse.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        // Create a new window with the PDF and trigger print
        const printWindow = window.open(url, '_blank')
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
            // Clean up the URL after printing
            setTimeout(() => {
              URL.revokeObjectURL(url)
            }, 1000)
          }
        } else {
          // Fallback: If popup blocked, create download link
          const link = document.createElement('a')
          link.href = url
          link.download = `RTGS_${response.data.id}_${new Date().toISOString().split('T')[0]}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
        
        toast.success('PDF opened for printing!')
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError)
        toast.error('Transaction created but PDF generation failed')
      } finally {
        setPdfLoading(false)
      }
      
      reset()
      clearSelection()
    } catch (error) {
      console.error('Failed to create transaction:', error)
      toast.error('Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 space-y-3 max-w-4xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">New RTGS Transfer</h1>
          <p className="mt-1 text-xs text-gray-600">
            Create a new Real Time Gross Settlement transfer with professional interface
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
            Transfer Details
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Beneficiary Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Beneficiary *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative" ref={dropdownRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Search by name, bank, account number, or IFSC code..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                    />
                    {selectedBeneficiary && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Hidden input for form validation */}
                  <input
                    {...register('beneficiary_id', { required: 'Please select a beneficiary' })}
                    type="hidden"
                  />
                  
                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredBeneficiaries.length > 0 ? (
                        <>
                          {filteredBeneficiaries.map(beneficiary => (
                            <button
                              key={beneficiary.id}
                              type="button"
                              onClick={() => selectBeneficiary(beneficiary)}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                                selectedBeneficiary?.id === beneficiary.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                  <span className="text-xs font-semibold text-blue-600">
                                    {beneficiary.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs leading-4 break-words">
                                    {beneficiary.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5 leading-3 break-words">
                                    <div className="truncate">{beneficiary.bank_name}</div>
                                    <div className="font-mono text-xs">A/C: {beneficiary.account_number} • IFSC: {beneficiary.ifsc_code}</div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                          
                          {/* Add New Beneficiary Option */}
                          <div 
                            onClick={() => {
                              setShowDropdown(false)
                              window.location.href = '/beneficiaries'
                            }}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 bg-gray-50"
                          >
                            <div className="flex items-center">
                              <Plus className="h-3 w-3 text-blue-600 mr-2" />
                              <span className="text-xs font-medium text-blue-600">
                                Add New Beneficiary
                              </span>
                            </div>
                          </div>
                        </>
                      ) : searchTerm ? (
                        <div className="px-3 py-4 text-center">
                          <div className="text-xs text-gray-500 mb-2">
                            No beneficiaries found matching "{searchTerm}"
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDropdown(false)
                              window.location.href = '/beneficiaries'
                            }}
                            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New Beneficiary
                          </button>
                        </div>
                      ) : (
                        <div className="px-3 py-2 text-xs text-gray-500 text-center">
                          Start typing to search beneficiaries
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Show All Button */}
                <button
                  type="button"
                  onClick={showAllBeneficiaries}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center"
                  title="Show all beneficiaries"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              {errors.beneficiary_id && (
                <p className="mt-1 text-xs text-red-600">{errors.beneficiary_id.message}</p>
              )}
              
              {/* Selected Beneficiary Display */}
              {selectedBeneficiary && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-semibold text-blue-600">
                        {selectedBeneficiary.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-blue-900">
                        {selectedBeneficiary.name}
                      </div>
                      <div className="text-xs text-blue-700">
                        {selectedBeneficiary.bank_name} • A/C: {selectedBeneficiary.account_number} • IFSC: {selectedBeneficiary.ifsc_code}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-blue-400 hover:text-blue-600 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Amount and Date Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Amount (₹) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 1, message: 'Amount must be greater than 0' },
                      max: { value: 99999999, message: 'Amount too large' }
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register('transaction_date', { required: 'Transaction date is required' })}
                    type="date"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.transaction_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.transaction_date.message}</p>
                )}
              </div>
            </div>

            {/* Additional Details Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Number (Optional)
                </label>
                <input
                  {...register('cheque_number')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter cheque number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose (Optional)
                </label>
                <input
                  {...register('purpose')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Purpose of transfer"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Optional)
              </label>
              <textarea
                {...register('remarks')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Additional remarks or notes"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              reset()
              clearSelection()
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading || pdfLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                Creating Transfer...
              </>
            ) : pdfLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                Opening Print Dialog...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2 inline-block" />
                Create Transfer & Print PDF
              </>
            )}
          </button>
        </div>
      </form>

      {/* Empty State */}
      {beneficiaries.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No beneficiaries found</h3>
            <p className="text-gray-500 mb-6">
              You need to add at least one beneficiary before creating a transfer.
            </p>
            <button 
              onClick={() => window.location.href = '/beneficiaries'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Beneficiary
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewRTGS
