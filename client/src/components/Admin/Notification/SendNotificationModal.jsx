import React, { useState } from 'react';
import { FaTimes, FaPaperPlane, FaUser, FaUsers, FaTag, FaFileAlt } from 'react-icons/fa';

const SendNotificationModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    loading,
    mode = 'single', // 'single' or 'multiple'
    initialUserId = null
}) => {
    const [formData, setFormData] = useState({
        user_ids: initialUserId ? [initialUserId] : [],
        title: '',
        message: '',
        type: 'SYSTEM',
        reference_id: ''
    });

    const [selectedUserId, setSelectedUserId] = useState('');

    const notificationTypes = [
        { value: 'ORDER', label: 'Order' },
        { value: 'PAYMENT', label: 'Payment' },
        { value: 'DELIVERY', label: 'Delivery' },
        { value: 'OFFER', label: 'Offer' },
        { value: 'FEEDBACK', label: 'Feedback' },
        { value: 'SYSTEM', label: 'System' }
    ];

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addUserId = () => {
        if (selectedUserId && !formData.user_ids.includes(parseInt(selectedUserId))) {
            setFormData(prev => ({
                ...prev,
                user_ids: [...prev.user_ids, parseInt(selectedUserId)]
            }));
            setSelectedUserId('');
        }
    };

    const removeUserId = (userId) => {
        setFormData(prev => ({
            ...prev,
            user_ids: prev.user_ids.filter(id => id !== userId)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (mode === 'single' && formData.user_ids.length !== 1) {
            alert('Please select exactly one user');
            return;
        }
        
        if (mode === 'multiple' && formData.user_ids.length === 0) {
            alert('Please select at least one user');
            return;
        }

        const payload = {
            userIds: mode === 'single' ? [formData.user_ids[0]] : formData.user_ids,
            title: formData.title,
            message: formData.message,
            type: formData.type,
            referenceId: formData.reference_id || null
        };

        onSubmit(payload, mode);
        
        // Reset and close
        setFormData({
            user_ids: [],
            title: '',
            message: '',
            type: 'SYSTEM',
            reference_id: ''
        });
        onClose();
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
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <FaPaperPlane />
                            {mode === 'single' ? 'Send Notification to User' : 'Send Notification to Users'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-4 pt-5 pb-4 sm:p-6">
                        {/* User Selection */}
                        {mode === 'multiple' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                                    <FaUsers /> Select Users
                                </label>
                                
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="number"
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        placeholder="Enter User ID"
                                        className="flex-1 px-3 py-2 border rounded"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={addUserId}
                                        disabled={loading || !selectedUserId}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Selected Users */}
                                {formData.user_ids.length > 0 && (
                                    <div className="mt-2">
                                        <div className="text-sm text-gray-600 mb-1">
                                            Selected Users ({formData.user_ids.length}):
                                        </div>
                                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded">
                                            {formData.user_ids.map(userId => (
                                                <div 
                                                    key={userId} 
                                                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                                                >
                                                    <span>User #{userId}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeUserId(userId)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'single' && !initialUserId && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                                    <FaUser /> User ID
                                </label>
                                <input
                                    type="number"
                                    name="user_id"
                                    value={formData.user_ids[0] || ''}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        user_ids: e.target.value ? [parseInt(e.target.value)] : [] 
                                    }))}
                                    placeholder="Enter User ID"
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Notification Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                                <FaTag /> Notification Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                            >
                                {notificationTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter notification title"
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                                <FaFileAlt /> Message
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Enter notification message"
                                rows="4"
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Reference ID (Optional) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Reference ID (Optional)</label>
                            <input
                                type="number"
                                name="reference_id"
                                value={formData.reference_id}
                                onChange={handleChange}
                                placeholder="e.g., Order ID, Payment ID"
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                <FaPaperPlane />
                                {loading ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SendNotificationModal;