import React, { useState } from 'react';
import { FaPaperPlane, FaUser, FaUsers, FaTag, FaFileAlt, FaTimes } from 'react-icons/fa';

const SendNotificationForm = ({ onSubmit, loading, users = [] }) => {
    const [formData, setFormData] = useState({
        user_ids: [],
        title: '',
        message: '',
        type: 'SYSTEM',
        reference_id: '',
        send_type: 'single' // 'single', 'multiple', or 'all'
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendTypeChange = (type) => {
        setFormData(prev => ({ 
            ...prev, 
            send_type: type,
            user_ids: type === 'all' ? [] : prev.user_ids
        }));
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
        
        let payload = {};
        
        if (formData.send_type === 'single') {
            // Send to single user
            if (formData.user_ids.length === 1) {
                payload = {
                    userId: formData.user_ids[0],
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                    referenceId: formData.reference_id || null
                };
            } else {
                alert('Please select exactly one user for single notification');
                return;
            }
        } else if (formData.send_type === 'multiple') {
            // Send to multiple users
            if (formData.user_ids.length === 0) {
                alert('Please select at least one user');
                return;
            }
            payload = {
                userIds: formData.user_ids,
                title: formData.title,
                message: formData.message,
                type: formData.type,
                referenceId: formData.reference_id || null
            };
        } else if (formData.send_type === 'all') {
            // Broadcast to all (handled by BroadcastForm)
            alert('Use the Broadcast tab for sending to all users');
            return;
        }

        onSubmit(payload, formData.send_type);
        
        // Reset form for single/multiple
        if (formData.send_type !== 'all') {
            setFormData(prev => ({
                ...prev,
                title: '',
                message: '',
                user_ids: [],
                reference_id: ''
            }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaPaperPlane /> Send Notification
            </h3>

            {/* Send Type Toggle */}
            <div className="flex mb-6 border-b">
                <button
                    type="button"
                    onClick={() => handleSendTypeChange('single')}
                    className={`flex-1 py-3 text-center border-b-2 font-medium flex items-center justify-center gap-2 ${
                        formData.send_type === 'single' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaUser /> Single User
                </button>
                <button
                    type="button"
                    onClick={() => handleSendTypeChange('multiple')}
                    className={`flex-1 py-3 text-center border-b-2 font-medium flex items-center justify-center gap-2 ${
                        formData.send_type === 'multiple' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaUsers /> Multiple Users
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* User Selection */}
                {formData.send_type !== 'all' && (
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                            <FaUser /> 
                            {formData.send_type === 'single' ? 'Select User' : 'Select Users'}
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
                                <div className="flex flex-wrap gap-2">
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
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Notification Type */}
                <div>
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
                <div>
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
                <div>
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
                <div>
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

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        <FaPaperPlane />
                        {loading ? 'Sending...' : (
                            formData.send_type === 'single' 
                                ? 'Send to User' 
                                : 'Send to Selected Users'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SendNotificationForm;