import React, { useState } from 'react';
import { FaTimes, FaEdit, FaSave, FaUser, FaCalendar, FaEye, FaEyeSlash, FaTag } from 'react-icons/fa';
import NotificationBadge from './NotificationBadge';

const NotificationDetailsModal = ({ 
    notification, 
    isOpen, 
    onClose, 
    onUpdate,
    onMarkRead,
    loading 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: notification?.title || '',
        message: notification?.message || '',
        type: notification?.type || 'SYSTEM',
        reference_id: notification?.reference_id || ''
    });

    if (!isOpen || !notification) return null;

    const notificationTypes = [
        { value: 'ORDER', label: 'Order' },
        { value: 'PAYMENT', label: 'Payment' },
        { value: 'DELIVERY', label: 'Delivery' },
        { value: 'OFFER', label: 'Offer' },
        { value: 'FEEDBACK', label: 'Feedback' },
        { value: 'SYSTEM', label: 'System' }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const updates = {};
        if (formData.title !== notification.title) updates.title = formData.title;
        if (formData.message !== notification.message) updates.message = formData.message;
        if (formData.type !== notification.type) updates.type = formData.type;
        if (formData.reference_id !== notification.reference_id) updates.reference_id = formData.reference_id;

        if (Object.keys(updates).length > 0) {
            onUpdate(notification.notification_id, updates);
            setIsEditing(false);
        } else {
            setIsEditing(false);
        }
    };

    const handleMarkRead = () => {
        if (!notification.is_read) {
            onMarkRead(notification.notification_id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-gray-900">
                                Notification Details #{notification.notification_id}
                            </h3>
                            <NotificationBadge 
                                type={notification.type} 
                                status={notification.is_read ? 'read' : 'unread'}
                                size="sm"
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-4 pt-5 pb-4 sm:p-6">
                        {/* User Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded border">
                            <div className="flex items-center gap-3 mb-3">
                                <FaUser className="text-gray-500" />
                                <div>
                                    <div className="font-medium">User Information</div>
                                    <div className="text-sm text-gray-600">
                                        User ID: {notification.user_id}
                                        {notification.user_name && ` (${notification.user_name})`}
                                        {notification.user_email && ` • ${notification.user_email}`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-3 border rounded">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                    <FaCalendar /> Created
                                </div>
                                <div className="font-medium">{formatDate(notification.created_at)}</div>
                            </div>
                            {notification.read_at ? (
                                <div className="p-3 border rounded bg-green-50">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <FaEye /> Read At
                                    </div>
                                    <div className="font-medium">{formatDate(notification.read_at)}</div>
                                </div>
                            ) : (
                                <div className="p-3 border rounded bg-red-50">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <FaEyeSlash /> Not Read Yet
                                    </div>
                                    <div className="font-medium">Unread</div>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                    disabled={loading}
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded border">
                                    {notification.title}
                                </div>
                            )}
                        </div>

                        {/* Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <FaTag /> Type
                            </label>
                            {isEditing ? (
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                    disabled={loading}
                                >
                                    {notificationTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 bg-gray-50 rounded border capitalize">
                                    {notification.type.toLowerCase()}
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Message</label>
                            {isEditing ? (
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="6"
                                    className="w-full px-3 py-2 border rounded"
                                    disabled={loading}
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap min-h-[150px]">
                                    {notification.message}
                                </div>
                            )}
                        </div>

                        {/* Reference ID */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Reference ID</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="reference_id"
                                    value={formData.reference_id}
                                    onChange={handleChange}
                                    placeholder="Optional reference ID"
                                    className="w-full px-3 py-2 border rounded"
                                    disabled={loading}
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded border">
                                    {notification.reference_id || 'No reference ID'}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-4 border-t">
                            <div className="flex gap-3">
                                {!notification.is_read && !isEditing && (
                                    <button
                                        onClick={handleMarkRead}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        <FaEye /> Mark as Read
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            <FaSave /> Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetailsModal;