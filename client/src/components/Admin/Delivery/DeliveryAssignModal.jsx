import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaExclamationCircle, FaCheck } from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';

const DeliveryAssignModal = ({ delivery, deliveryPersons = [], onClose, onSuccess }) => {
    const {
        assignDeliveryPerson,
        adminReassignDeliveryPerson,
        loading,
        error,
        clearError
    } = useDeliveryContext();

    const [formData, setFormData] = useState({
        delivery_person_id: delivery?.delivery_person_id || '',
        order_id: delivery?.order_id || ''
    });
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (delivery) {
            setFormData({
                delivery_person_id: delivery.delivery_person_id || '',
                order_id: delivery.order_id
            });
        }
    }, [delivery]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValidationError('');
        clearError();
    };

    const validateForm = () => {
        if (!formData.delivery_person_id) {
            setValidationError('Please select a delivery person');
            return false;
        }
        if (!formData.order_id) {
            setValidationError('Order ID is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        setValidationError('');
        
        try {
            let result;
            if (delivery.delivery_person_id) {
                // Reassign
                result = await adminReassignDeliveryPerson({
                    delivery_id: delivery.delivery_id,
                    new_delivery_person_id: formData.delivery_person_id
                });
            } else {
                // Assign
                result = await assignDeliveryPerson({
                    order_id: formData.order_id,
                    delivery_person_id: formData.delivery_person_id
                });
            }
            
            if (result.success) {
                onSuccess();
            } else {
                setValidationError(result.message || 'Operation failed');
            }
        } catch (error) {
            setValidationError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeDeliveryPersons = deliveryPersons.filter(person => person.status === 'ACTIVE');
    const inactiveDeliveryPersons = deliveryPersons.filter(person => person.status !== 'ACTIVE');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {delivery.delivery_person_id ? 'Reassign Delivery Person' : 'Assign Delivery Person'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Order #{delivery.order_id} • Delivery #{delivery.delivery_id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Messages */}
                {(error || validationError) && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start">
                            <FaExclamationCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-red-700">
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4">
                    <div className="space-y-4">
                        {/* Order ID (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order ID
                            </label>
                            <input
                                type="text"
                                value={formData.order_id}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                            />
                        </div>

                        {/* Delivery Person Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Delivery Person
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="delivery_person_id"
                                    value={formData.delivery_person_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Choose a delivery person...</option>
                                    
                                    {/* Active delivery persons */}
                                    {activeDeliveryPersons.length > 0 && (
                                        <optgroup label="Active Delivery Persons">
                                            {activeDeliveryPersons.map(person => (
                                                <option key={person.delivery_person_id} value={person.delivery_person_id}>
                                                    {person.user_name} (ID: {person.delivery_person_id}) - Rating: {person.rating || 'N/A'}/5
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    
                                    {/* Inactive delivery persons */}
                                    {inactiveDeliveryPersons.length > 0 && (
                                        <optgroup label="Inactive Delivery Persons">
                                            {inactiveDeliveryPersons.map(person => (
                                                <option key={person.delivery_person_id} value={person.delivery_person_id}>
                                                    {person.user_name} (ID: {person.delivery_person_id}) - {person.status}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                    {activeDeliveryPersons.length} active delivery persons available
                                </p>
                                <p className="text-xs text-gray-500">
                                    {deliveryPersons.length - activeDeliveryPersons.length} inactive
                                </p>
                            </div>
                        </div>

                        {/* Current Assignment Info */}
                        {delivery.delivery_person_id && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center">
                                    <FaCheck className="w-4 h-4 text-blue-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-blue-700 font-medium">
                                            Currently assigned to: Delivery Person #{delivery.delivery_person_id}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Selecting a new person will reassign this delivery
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !formData.delivery_person_id}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {delivery.delivery_person_id ? 'Reassigning...' : 'Assigning...'}
                                </>
                            ) : (
                                <>
                                    <FaCheck />
                                    {delivery.delivery_person_id ? 'Reassign Delivery' : 'Assign Delivery'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryAssignModal;