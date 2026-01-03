import React, { useState } from 'react';
import { FaBroadcastTower, FaTag, FaFileAlt, FaBullhorn } from 'react-icons/fa';

const BroadcastForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'SYSTEM',
        reference_id: ''
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const payload = {
            title: formData.title,
            message: formData.message,
            type: formData.type,
            reference_id: formData.reference_id || null
        };
        
        onSubmit(payload);
        
        // Reset form
        setFormData({
            title: '',
            message: '',
            type: 'SYSTEM',
            reference_id: ''
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 border">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FaBroadcastTower /> Broadcast to All Users
            </h3>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                    <FaBullhorn className="text-yellow-600" />
                    <span className="font-medium text-yellow-800">Important Notice</span>
                </div>
                <p className="text-sm text-yellow-700">
                    This will send a notification to <strong>all users</strong> in the system. 
                    Use this feature only for important announcements or system-wide updates.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Notification Type */}
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                        <FaTag /> Broadcast Type
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
                        placeholder="Enter broadcast title"
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
                        placeholder="Enter broadcast message that will be sent to all users"
                        rows="5"
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
                        placeholder="e.g., System Update ID, Announcement ID"
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                    >
                        <FaBroadcastTower />
                        {loading ? 'Broadcasting...' : 'Broadcast to All Users'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BroadcastForm;