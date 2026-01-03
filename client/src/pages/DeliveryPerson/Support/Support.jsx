import React, { useEffect, useState } from 'react';
import { useSupportContext } from '../../../context/delivery_panel/SupportContext';
import DeliveryLayout from '../../../components/DeliveryPerson/Layout/DeliveryLayout';
import ContactInfo from '../../../components/DeliveryPerson/Support/ContactInfo';
import IssueForm from '../../../components/DeliveryPerson/Support/IssueForm';
import './Support.css';

const Support = () => {
    const {
        supportContactInfo,
        recentIssues,
        loading,
        error,
        submissionSuccess,
        fetchAllSupportData,
        fetchSupportContactInfo,
        clearError,
        simulateIssueTypes
    } = useSupportContext();

    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [showRecentIssues, setShowRecentIssues] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAllSupportData();
            } catch (err) {
                console.error('Error loading support data:', err);
            }
        };
        
        loadData();
    }, []);

    const handleCallSupport = () => {
        window.open('tel:+911800123456', '_self');
    };

    const handleStartChat = () => {
        alert('Chat support would open in a real application. Please use phone or email for now.');
    };

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const toggleRecentIssues = () => {
        setShowRecentIssues(!showRecentIssues);
    };

    const faqData = [
        {
            question: "How do I update my availability status?",
            answer: "You can update your availability status by clicking on the status button in the top header. Toggle between Available, Busy, and Offline as needed."
        },
        {
            question: "When will I receive my payments?",
            answer: "Payments are processed every week on Monday. You can check your earnings and payout schedule in the Earnings section."
        },
        {
            question: "What should I do if a customer is not available?",
            answer: "Try calling the customer. If unavailable, you can mark the delivery as 'Customer Not Available' in the app and follow the instructions for return delivery."
        },
        {
            question: "How do I report a damaged package?",
            answer: "Take photos of the damaged package immediately. Report it through the app under 'Report Issue' before attempting delivery. Do not deliver damaged packages."
        },
        {
            question: "What happens if my vehicle breaks down?",
            answer: "Immediately inform support through the app or call support. We'll help arrange alternative transportation and reschedule your deliveries."
        }
    ];

    // Get quick help topics from API or fallback
    const quickTopics = supportContactInfo?.quick_topics || [
        "How to mark delivery?",
        "Payment issues", 
        "Route navigation help",
        "App technical issues"
    ];

    if (loading && !supportContactInfo) {
        return (
            <DeliveryLayout>
                <div className="page active" id="support-page">
                    <div className="page-header">
                        <h2>Support & Help Center</h2>
                    </div>
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading support information...</p>
                    </div>
                </div>
            </DeliveryLayout>
        );
    }

    return (
        <DeliveryLayout>
            <div className="page active" id="support-page">
                <div className="page-header">
                    <h2>Support & Help Center</h2>
                    <button 
                        className="btn-primary" 
                        onClick={handleCallSupport}
                        disabled={loading}
                    >
                        <i data-lucide="headphones"></i>
                        Call Support
                    </button>
                </div>

                {error && (
                    <div className="error-alert">
                        <div className="alert-content">
                            <i data-lucide="alert-circle"></i>
                            <span>{error}</span>
                        </div>
                        <button className="alert-close" onClick={clearError}>
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                )}

                {submissionSuccess && (
                    <div className="success-alert">
                        <div className="alert-content">
                            <i data-lucide="check-circle"></i>
                            <span>Your issue has been submitted successfully! Our support team will contact you soon.</span>
                        </div>
                        <button className="alert-close" onClick={clearError}>
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                )}

                {/* Quick Help Section */}
                <div className="quick-help">
                    <h3>Quick Help Topics</h3>
                    <div className="help-topics">
                        {quickTopics.map((topic, index) => (
                            <button 
                                key={index} 
                                className="topic-btn"
                                onClick={() => alert(`Searching for: ${topic}`)}
                            >
                                <i data-lucide="help-circle"></i>
                                <span>{topic}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contact Support Section */}
                <ContactInfo 
                    contactInfo={supportContactInfo}
                    loading={loading}
                    onCallSupport={handleCallSupport}
                    onStartChat={handleStartChat}
                />

                {/* FAQ Section */}
                <div className="faq-section">
                    <h3>Frequently Asked Questions</h3>
                    <div className="faq-list">
                        {faqData.map((faq, index) => (
                            <div className="faq-item" key={index}>
                                <div 
                                    className="faq-question" 
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <strong>{faq.question}</strong>
                                    <i 
                                        data-lucide="chevron-down"
                                        style={{ 
                                            transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    ></i>
                                </div>
                                {expandedFAQ === index && (
                                    <div className="faq-answer show">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Issues Section */}
                {recentIssues && recentIssues.length > 0 && (
                    <div className="recent-issues-section">
                        <div className="section-header">
                            <h3>Your Recent Issues</h3>
                            <button 
                                className="btn-text"
                                onClick={toggleRecentIssues}
                            >
                                {showRecentIssues ? 'Hide' : 'Show'} Recent Issues
                                <i data-lucide={showRecentIssues ? 'chevron-up' : 'chevron-down'}></i>
                            </button>
                        </div>
                        
                        {showRecentIssues && (
                            <div className="recent-issues-list">
                                {recentIssues.slice(0, 3).map((issue, index) => (
                                    <div className="issue-item" key={index}>
                                        <div className="issue-header">
                                            <span className={`issue-type ${issue.status?.toLowerCase() || 'pending'}`}>
                                                {issue.issue_type || 'Issue'}
                                            </span>
                                            <span className="issue-date">
                                                {issue.created_at || 'Recently'}
                                            </span>
                                        </div>
                                        <p className="issue-description">
                                            {issue.description || 'No description available'}
                                        </p>
                                        <div className="issue-status">
                                            <span className={`status-badge ${issue.status?.toLowerCase() || 'pending'}`}>
                                                {issue.status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {recentIssues.length > 3 && (
                                    <button className="view-all-btn">
                                        View All {recentIssues.length} Issues
                                        <i data-lucide="chevron-right"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Report Issue Form */}
                <div className="report-issue">
                    <h3>Report an Issue</h3>
                    <IssueForm 
                        loading={loading}
                        onSubmitSuccess={() => {
                            // Clear any previous errors
                            clearError();
                            // Fetch updated recent issues
                            // fetchAllSupportData();
                        }}
                    />
                </div>

                {/* Emergency Support Card */}
                <div className="emergency-card">
                    <div className="emergency-icon">
                        <i data-lucide="alert-triangle"></i>
                    </div>
                    <div className="emergency-info">
                        <h4>Emergency Support</h4>
                        <p>For urgent assistance during deliveries, call our 24/7 emergency line:</p>
                        <a href="tel:+911123456789" className="emergency-number">
                            <i data-lucide="phone"></i>
                            +91 112 345 6789
                        </a>
                    </div>
                </div>
            </div>
        </DeliveryLayout>
    );
};

export default Support;