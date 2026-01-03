import React, { useEffect, useState } from 'react';
import { FaTimes, FaTruck, FaUser, FaMapMarkerAlt, FaCalendar, FaCheckCircle, FaExclamationTriangle, FaClock, FaBox, FaPhone, FaMapPin } from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';

const DeliveryDetailsModal = ({ delivery, onClose }) => {
    const {
        deliveryTimeline,
        adminGetDeliveryTimeline,
        loading
    } = useDeliveryContext();

    const [timelineLoading, setTimelineLoading] = useState(false);
    const [timelineError, setTimelineError] = useState(null);

    useEffect(() => {
        if (delivery) {
            loadTimeline();
        }
    }, [delivery]);

    const loadTimeline = async () => {
        setTimelineLoading(true);
        setTimelineError(null);
        try {
            await adminGetDeliveryTimeline(delivery.delivery_id);
        } catch (error) {
            setTimelineError('Failed to load timeline');
        } finally {
            setTimelineLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
            case 'PICKED': return 'bg-yellow-100 text-yellow-800';
            case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ASSIGNED': return <FaUser className="w-4 h-4 mr-1" />;
            case 'PICKED': return <FaBox className="w-4 h-4 mr-1" />;
            case 'OUT_FOR_DELIVERY': return <FaTruck className="w-4 h-4 mr-1" />;
            case 'DELIVERED': return <FaCheckCircle className="w-4 h-4 mr-1" />;
            case 'CANCELLED': return <FaExclamationTriangle className="w-4 h-4 mr-1" />;
            default: return <FaClock className="w-4 h-4 mr-1" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not yet';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return 'N/A';
        try {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diff = endDate - startDate;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaTruck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Delivery Details
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Complete information for delivery #{delivery.delivery_id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        title="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="p-6">
                        {/* Delivery Summary */}
                        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-blue-600 mb-1">Delivery ID</p>
                                    <p className="text-2xl font-bold text-gray-800">#{delivery.delivery_id}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-blue-600 mb-1">Order ID</p>
                                    <p className="text-2xl font-bold text-gray-800">#{delivery.order_id}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-blue-600 mb-1">Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                                        {getStatusIcon(delivery.status)}
                                        {delivery.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Delivery Information */}
                            <div className="space-y-6">
                                {/* Basic Info Card */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                        <FaTruck className="w-4 h-4" />
                                        Delivery Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Delivery Person</span>
                                            <span className="font-medium">
                                                {delivery.delivery_person_id ? 
                                                    `DP#${delivery.delivery_person_id}` : 
                                                    <span className="text-gray-400">Not assigned</span>
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Assigned At</span>
                                            <span className="font-medium">{formatDate(delivery.assigned_at)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Delivered At</span>
                                            <span className="font-medium">{formatDate(delivery.delivered_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Summary Card */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                        <FaClock className="w-4 h-4" />
                                        Delivery Timeline
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Duration</span>
                                            <span className="font-medium">
                                                {calculateDuration(delivery.assigned_at, delivery.delivered_at)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Created At</span>
                                            <span className="font-medium">{formatDate(delivery.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Last Updated</span>
                                            <span className="font-medium">{formatDate(delivery.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Location Info */}
                            <div className="space-y-6">
                                {/* Customer Information Card */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                        <FaUser className="w-4 h-4" />
                                        Customer Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <FaUser className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {delivery.customer_name || 'Customer Name'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {delivery.customer_phone || 'Phone not available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Card */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                        <FaMapPin className="w-4 h-4" />
                                        Delivery Location
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mt-1" />
                                            <div>
                                                <p className="font-medium text-gray-800">Delivery Address</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {delivery.delivery_address || 'Address not specified'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Timeline Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <FaMapMarkerAlt className="w-4 h-4" />
                                    Delivery Timeline
                                </h4>
                                <button
                                    onClick={loadTimeline}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    disabled={timelineLoading}
                                >
                                    {timelineLoading ? 'Refreshing...' : 'Refresh Timeline'}
                                </button>
                            </div>
                            
                            {timelineLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : timelineError ? (
                                <div className="text-center py-8">
                                    <FaExclamationTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">Failed to load timeline</p>
                                    <button
                                        onClick={loadTimeline}
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    
                                    {/* Timeline Items */}
                                    <div className="space-y-6">
                                        {(deliveryTimeline && deliveryTimeline.length > 0) ? (
                                            deliveryTimeline.map((item, index) => (
                                                <div key={index} className="relative flex items-start">
                                                    {/* Timeline Dot */}
                                                    <div className={`absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full ${
                                                        item.status === 'DELIVERED' ? 'bg-green-500' :
                                                        item.status === 'CANCELLED' ? 'bg-red-500' :
                                                        'bg-blue-500'
                                                    }`}></div>
                                                    
                                                    {/* Content */}
                                                    <div className="ml-10 flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusIcon(item.status)}
                                                                    <p className="font-medium text-gray-800">{item.status}</p>
                                                                </div>
                                                                {item.description && (
                                                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500">
                                                                    {formatDate(item.timestamp)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            // Default timeline based on status
                                            <>
                                                <div className="relative flex items-start">
                                                    <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500"></div>
                                                    <div className="ml-10">
                                                        <div className="flex items-center gap-2">
                                                            <FaUser className="w-4 h-4" />
                                                            <p className="font-medium text-gray-800">CREATED</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Delivery was created
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {delivery.assigned_at && (
                                                    <div className="relative flex items-start">
                                                        <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500"></div>
                                                        <div className="ml-10">
                                                            <div className="flex items-center gap-2">
                                                                <FaUser className="w-4 h-4" />
                                                                <p className="font-medium text-gray-800">ASSIGNED</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {formatDate(delivery.assigned_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {delivery.status === 'DELIVERED' && delivery.delivered_at && (
                                                    <div className="relative flex items-start">
                                                        <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-green-500"></div>
                                                        <div className="ml-10">
                                                            <div className="flex items-center gap-2">
                                                                <FaCheckCircle className="w-4 h-4" />
                                                                <p className="font-medium text-gray-800">DELIVERED</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {formatDate(delivery.delivered_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {delivery.status === 'CANCELLED' && (
                                                    <div className="relative flex items-start">
                                                        <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-red-500"></div>
                                                        <div className="ml-10">
                                                            <div className="flex items-center gap-2">
                                                                <FaExclamationTriangle className="w-4 h-4" />
                                                                <p className="font-medium text-gray-800">CANCELLED</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Delivery was cancelled
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Last updated: {formatDate(delivery.updated_at)}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDetailsModal;