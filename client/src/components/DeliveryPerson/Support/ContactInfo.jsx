import React from 'react';
import './ContactInfo.css';

const ContactInfo = ({ contactInfo, loading, onCallSupport, onStartChat }) => {
    if (loading && !contactInfo) {
        return (
            <div className="contact-support loading">
                <div className="section-header-skeleton">
                    <div className="title-skeleton"></div>
                </div>
                <div className="contact-methods-skeleton">
                    {[1, 2, 3].map(i => (
                        <div className="contact-card-skeleton" key={i}>
                            <div className="contact-icon-skeleton"></div>
                            <div className="contact-info-skeleton">
                                <div className="contact-title-skeleton"></div>
                                <div className="contact-desc-skeleton"></div>
                                <div className="contact-link-skeleton"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Safe data access
    const getContactMethods = () => {
        if (!contactInfo?.contact_methods) {
            return [
                {
                    method: 'phone',
                    label: 'Call Support',
                    description: 'Available 24/7',
                    contact: '1800-123-456',
                    action_url: 'tel:+911800123456',
                    action_type: 'link'
                },
                {
                    method: 'chat',
                    label: 'Chat Support',
                    description: 'Live chat available',
                    contact: 'Start Chat',
                    action_type: 'button'
                },
                {
                    method: 'email',
                    label: 'Email Support',
                    description: 'Response within 2 hours',
                    contact: 'support@nexora.com',
                    action_url: 'mailto:support@nexora.com',
                    action_type: 'link'
                }
            ];
        }

        return contactInfo.contact_methods;
    };

    const contactMethods = getContactMethods();

    const getIconForMethod = (method) => {
        switch(method) {
            case 'phone':
                return 'phone';
            case 'chat':
                return 'message-circle';
            case 'email':
                return 'mail';
            case 'whatsapp':
                return 'message-square';
            default:
                return 'help-circle';
        }
    };

    const handleAction = (method, actionType, actionUrl) => {
        if (method === 'phone') {
            onCallSupport();
        } else if (method === 'chat') {
            onStartChat();
        } else if (actionType === 'link' && actionUrl) {
            window.open(actionUrl, '_blank');
        }
    };

    return (
        <div className="contact-support">
            <h3>Contact Support</h3>
            <div className="contact-methods">
                {contactMethods.map((method, index) => (
                    <div className="contact-card" key={index}>
                        <div className="contact-icon">
                            <i data-lucide={getIconForMethod(method.method)}></i>
                        </div>
                        <div className="contact-info">
                            <strong>{method.label}</strong>
                            <span>{method.description}</span>
                            {method.action_type === 'link' && method.action_url ? (
                                <a 
                                    href={method.action_url} 
                                    className="contact-link"
                                    onClick={(e) => {
                                        if (method.method === 'phone') {
                                            e.preventDefault();
                                            handleAction(method.method, method.action_type, method.action_url);
                                        }
                                    }}
                                >
                                    {method.contact}
                                </a>
                            ) : (
                                <button 
                                    className="contact-link"
                                    onClick={() => handleAction(method.method, method.action_type, method.action_url)}
                                >
                                    {method.contact}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactInfo;