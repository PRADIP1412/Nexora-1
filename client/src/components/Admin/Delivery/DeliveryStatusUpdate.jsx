import React, { useState } from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle, FaTruck, FaBox, FaShippingFast, FaCheck, FaBan } from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';

const DeliveryStatusUpdate = ({ delivery, onClose, onSuccess }) => {
    const {
        adminUpdateDeliveryStatus,
        adminValidateDeliveryCompletion,
        loading,
        error,
        clearError
    } = useDeliveryContext();

    const [status, setStatus] = useState(delivery?.status || 'ASSIGNED');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [notes, setNotes] = useState('');

    const statusOptions = [
        { 
            value: 'ASSIGNED', 
            label: 'Assigned', 
            description: 'Delivery person assigned to order',
            icon: <FaCheckCircle className="w-5 h-5 text-blue-500" />,
            color: 'border-blue-200 bg-blue-50'
        },
        { 
            value: 'PICKED', 
            label: 'Picked Up', 
            description: 'Order picked up from store/warehouse',
            icon: <FaBox className="w-5 h-5 text-yellow-500" />,
            color: 'border-yellow-200 bg-yellow-50'
        },
        { 
            value: 'OUT_FOR_DELIVERY', 
            label: 'Out for Delivery', 
            description: 'On the way to customer location',
            icon: <FaTruck className="w-5 h-5 text-orange-500" />,
            color: 'border-orange-200 bg-orange-50'
        },
        { 
            value: 'DELIVERED', 
            label: 'Delivered', 
            description: 'Successfully delivered to customer',
            icon: <FaCheck className="w-5 h-5 text-green-500" />,
            color: 'border-green-200 bg-green-50'
        },
        { 
            value: 'CANCELLED', 
            label: 'Cancelled', 
            description: 'Delivery cancelled',
            icon: <FaBan className="w-5 h-5 text-red-500" />,
            color: 'border-red-200 bg-red-50'
        }
    ];

    const getStatusColor = (statusValue) => {
        switch (statusValue) {
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
            case 'PICKED': return 'bg-yellow-100 text-yellow-800';
            case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (statusValue) => {
        switch (statusValue) {
            case 'ASSIGNED': return <FaCheckCircle className="w-4 h-4 mr-1" />;
            case 'PICKED': return <FaBox className="w-4 h-4 mr-1" />;
            case 'OUT_FOR_DELIVERY': return <FaTruck className="w-4 h-4 mr-1" />;
            case 'DELIVERED': return <FaCheck className="w-4 h-4 mr-1" />;
            case 'CANCELLED': return <FaBan className="w-4 h-4 mr-1" />;
            default: return <FaCheckCircle className="w-4 h-4 mr-1" />;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (status === delivery.status) {
            setValidationError('Status is already set to this value');
            return;
        }

        // Validation for status transitions
        const validTransitions = {
            'ASSIGNED': ['PICKED', 'CANCELLED'],
            'PICKED': ['OUT_FOR_DELIVERY', 'CANCELLED'],
            'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
            'DELIVERED': [],
            'CANCELLED': []
        };

        if (delivery.status && validTransitions[delivery.status]) {
            if (!validTransitions[delivery.status].includes(status)) {
                setValidationError(`Cannot change status from ${delivery.status} to ${status}`);
                return;
            }
        }

        setIsSubmitting(true);
        setValidationError('');
        
        try {
            const result = await adminUpdateDeliveryStatus(delivery.delivery_id, status);
            
            if (result.success) {
                if (status === 'DELIVERED') {
                    // Also validate completion
                    await adminValidateDeliveryCompletion(delivery.delivery_id);
                }
                onSuccess();
            } else {
                setValidationError(result.message || 'Failed to update status');
            }
        } catch (error) {
            setValidationError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickValidate = async () => {
        if (window.confirm('Are you sure you want to mark this delivery as completed and validated? This will create earnings records.')) {
            setIsSubmitting(true);
            setValidationError('');
            
            try {
                const result = await adminValidateDeliveryCompletion(delivery.delivery_id);
                if (result.success) {
                    onSuccess();
                } else {
                    setValidationError(result.message || 'Failed to validate delivery');
                }
            } catch (error) {
                setValidationError('An unexpected error occurred');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleQuickCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this delivery? This action cannot be undone.')) {
            setIsSubmitting(true);
            setValidationError('');
            
            try {
                const result = await adminUpdateDeliveryStatus(delivery.delivery_id, 'CANCELLED');
                if (result.success) {
                    onSuccess();
                } else {
                    setValidationError(result.message || 'Failed to cancel delivery');
                }
            } catch (error) {
                setValidationError('An unexpected error occurred');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaShippingFast className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Update Delivery Status
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Delivery #{delivery.delivery_id} • Order #{delivery.order_id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        disabled={isSubmitting}
                        title="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Messages */}
                {(error || validationError) && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start">
                            <FaExclamationCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-red-700 font-medium">
                                    {validationError || error}
                                </p>
                                {error && (
                                    <button
                                        onClick={clearError}
                                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                                    >
                                        Dismiss
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Status Display */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Current Status</p>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                                    {getStatusIcon(delivery.status)}
                                    {delivery.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Last updated: {new Date(delivery.updated_at || delivery.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Delivery ID</p>
                            <p className="font-medium text-gray-800">#{delivery.delivery_id}</p>
                        </div>
                    </div>
                </div>

                {/* Status Selection */}
                <form onSubmit={handleSubmit} className="px-6 py-4">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select New Status
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        
                        <div className="space-y-3">
                            {statusOptions.map((option) => (
                                <div 
                                    key={option.value}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                        status === option.value 
                                            ? `${option.color} border-2 border-blue-500 ring-2 ring-blue-100` 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                        if (!isSubmitting) {
                                            setStatus(option.value);
                                            setValidationError('');
                                        }
                                    }}
                                >
                                    <div className="flex items-start">
                                        <div className={`p-2 rounded-lg ${status === option.value ? 'bg-white shadow' : 'bg-gray-100'}`}>
                                            {option.icon}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className={`font-medium ${
                                                        status === option.value ? 'text-blue-700' : 'text-gray-800'
                                                    }`}>
                                                        {option.label}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                                </div>
                                                <div>
                                                    <input
                                                        type="radio"
                                                        id={`status-${option.value}`}
                                                        name="status"
                                                        value={option.value}
                                                        checked={status === option.value}
                                                        onChange={(e) => {
                                                            setStatus(e.target.value);
                                                            setValidationError('');
                                                        }}
                                                        className="w-4 h-4 text-blue-600"
                                                        disabled={isSubmitting || (delivery.status === 'DELIVERED' && option.value !== 'DELIVERED')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                            rows="3"
                            placeholder="Add any notes about this status change..."
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            These notes will be added to the delivery timeline
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-3">
                            {delivery.status !== 'DELIVERED' && delivery.status !== 'CANCELLED' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleQuickValidate}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                                        disabled={isSubmitting}
                                    >
                                        <FaCheck />
                                        Quick Validate as Delivered
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleQuickCancel}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
                                        disabled={isSubmitting}
                                    >
                                        <FaBan />
                                        Cancel Delivery
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Quick actions will update status and handle all necessary validations
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || status === delivery.status}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating Status...
                                </>
                            ) : (
                                <>
                                    <FaCheck />
                                    Update Status
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Information */}
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div>
                            <span className="font-medium">Note:</span> Status changes are logged in the delivery timeline
                        </div>
                        <div>
                            Delivery Person: {delivery.delivery_person_id ? `DP#${delivery.delivery_person_id}` : 'Not assigned'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryStatusUpdate;