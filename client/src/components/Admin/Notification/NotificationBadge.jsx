import React from 'react';
import { FaBox, FaCreditCard, FaTruck, FaTag, FaComment, FaCog, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';

const NotificationBadge = ({ type, status, size = 'sm' }) => {
    // Type icons and colors
    const typeConfig = {
        ORDER: { icon: FaBox, color: 'bg-blue-100 text-blue-800 border-blue-200' },
        PAYMENT: { icon: FaCreditCard, color: 'bg-green-100 text-green-800 border-green-200' },
        DELIVERY: { icon: FaTruck, color: 'bg-purple-100 text-purple-800 border-purple-200' },
        OFFER: { icon: FaTag, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        FEEDBACK: { icon: FaComment, color: 'bg-pink-100 text-pink-800 border-pink-200' },
        SYSTEM: { icon: FaCog, color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };

    // Status icons
    const StatusIcon = status === 'read' ? FaEnvelopeOpen : FaEnvelope;
    
    const typeInfo = typeConfig[type] || typeConfig.SYSTEM;
    const TypeIcon = typeInfo.icon;
    
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    return (
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${typeInfo.color} ${sizeClasses[size]}`}>
                <TypeIcon className="text-xs" />
                <span className="capitalize">{type.toLowerCase()}</span>
            </span>
            
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${sizeClasses[size]} ${
                status === 'read' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
            }`}>
                <StatusIcon className="text-xs" />
                <span className="capitalize">{status}</span>
            </span>
        </div>
    );
};

export default NotificationBadge;