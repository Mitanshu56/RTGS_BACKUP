import React, { useState, useEffect } from 'react';

const BankDetails = () => {
    const [formData, setFormData] = useState({
        account_number: '',
        account_name: '',
        bank_name: '',
        branch_name: '',
        ifsc_code: '',
        swift_code: '',
        pan_number: '',
        mobile: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [hasDetails, setHasDetails] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/remitter/me');
            
            if (response.ok) {
                const data = await response.json();
                // Check if data is not null and has the required properties
                if (data && typeof data === 'object') {
                    setFormData({
                        account_number: data.account_number || '',
                        account_name: data.account_name || '',
                        bank_name: data.bank_name || '',
                        branch_name: data.branch_name || '',
                        ifsc_code: data.ifsc_code || '',
                        swift_code: data.swift_code || '',
                        pan_number: data.pan_number || '',
                        mobile: data.mobile || ''
                    });
                    setHasDetails(true);
                } else {
                    // Data is null or invalid, treat as no bank details
                    setHasDetails(false);
                    setEditing(true);
                }
            } else if (response.status === 404) {
                // No bank details found
                setHasDetails(false);
                setEditing(true);
            }
        } catch (error) {
            console.error('Error fetching bank details:', error);
            // On error, reset to default state
            setHasDetails(false);
            setEditing(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const url = hasDetails ? 'http://localhost:8000/api/remitter/' : 'http://localhost:8000/api/remitter/';
            const method = hasDetails ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                // Safely set the form data with proper null checking
                if (data && typeof data === 'object') {
                    setFormData({
                        account_number: data.account_number || '',
                        account_name: data.account_name || '',
                        bank_name: data.bank_name || '',
                        branch_name: data.branch_name || '',
                        ifsc_code: data.ifsc_code || '',
                        swift_code: data.swift_code || '',
                        pan_number: data.pan_number || '',
                        mobile: data.mobile || ''
                    });
                }
                setHasDetails(true);
                setEditing(false);
                setMessage('Bank details saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const error = await response.json();
                setMessage(`Error: ${error.detail || 'Failed to save bank details'}`);
            }
        } catch (error) {
            console.error('Error saving bank details:', error);
            setMessage('Error: Failed to save bank details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = () => {
        setEditing(true);
        setMessage('');
    };

    const handleCancel = () => {
        setEditing(false);
        fetchBankDetails(); // Reset form to original values
        setMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Bank Details</h2>
                {hasDetails && !editing && (
                    <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Edit Details
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('Error') 
                        ? 'bg-red-100 text-red-700 border border-red-300' 
                        : 'bg-green-100 text-green-700 border border-green-300'
                }`}>
                    {message}
                </div>
            )}

            {!hasDetails && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800">
                        <strong>Setup Required:</strong> Please add your bank details to automatically include them in generated RTGS PDFs.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number *
                        </label>
                        <input
                            type="text"
                            name="account_number"
                            value={formData.account_number}
                            onChange={handleChange}
                            disabled={!editing}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter account number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Name *
                        </label>
                        <input
                            type="text"
                            name="account_name"
                            value={formData.account_name}
                            onChange={handleChange}
                            disabled={!editing}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter account holder name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name *
                        </label>
                        <input
                            type="text"
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleChange}
                            disabled={!editing}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter bank name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Branch Name *
                        </label>
                        <input
                            type="text"
                            name="branch_name"
                            value={formData.branch_name}
                            onChange={handleChange}
                            disabled={!editing}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter branch name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            IFSC Code *
                        </label>
                        <input
                            type="text"
                            name="ifsc_code"
                            value={formData.ifsc_code}
                            onChange={handleChange}
                            disabled={!editing}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter IFSC code"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SWIFT Code
                        </label>
                        <input
                            type="text"
                            name="swift_code"
                            value={formData.swift_code}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter SWIFT code (optional)"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PAN Number *
                        </label>
                        <input
                            type="text"
                            name="pan_number"
                            value={formData.pan_number}
                            onChange={handleChange}
                            disabled={!editing}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter PAN number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number (Optional)
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            disabled={!editing}
                            maxLength="10"
                            pattern="[6-9][0-9]{9}"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter mobile number (optional)"
                        />
                    </div>
                </div>

                {editing && (
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Saving...' : 'Save Details'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default BankDetails;