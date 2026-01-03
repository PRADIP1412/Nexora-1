import React, { useState, useRef } from 'react';
import { useSupportContext } from '../../../context/delivery_panel/SupportContext';
import './IssueForm.css';

const IssueForm = ({ loading, onSubmitSuccess }) => {
    const { submitIssue } = useSupportContext();
    
    const [formData, setFormData] = useState({
        issue_type: '',
        message: '',
        order_id: '',
        attachment: null
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const issueTypes = [
        { value: '', label: 'Select issue type' },
        { value: 'DELIVERY_ISSUE', label: 'Delivery Issue' },
        { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
        { value: 'APP_TECHNICAL_ISSUE', label: 'App Technical Issue' },
        { value: 'VEHICLE_ISSUE', label: 'Vehicle Issue' },
        { value: 'OTHER', label: 'Other' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only JPG, PNG, and PDF files are allowed');
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                attachment: file
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.issue_type) {
            errors.issue_type = 'Please select an issue type';
        }
        
        if (!formData.message.trim()) {
            errors.message = 'Please describe your issue';
        } else if (formData.message.trim().length < 10) {
            errors.message = 'Description must be at least 10 characters';
        }
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Prepare form data for submission
            const issueData = {
                issue_type: formData.issue_type,
                message: formData.message,
                ...(formData.order_id && { order_id: formData.order_id })
            };
            
            const result = await submitIssue(issueData);
            
            if (result.success) {
                // Reset form
                setFormData({
                    issue_type: '',
                    message: '',
                    order_id: '',
                    attachment: null
                });
                setFormErrors({});
                
                // Clear file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                
                // Notify parent component
                if (onSubmitSuccess) {
                    onSubmitSuccess();
                }
                
                // Show success message (handled by parent)
            } else {
                setFormErrors({ submit: result.message });
            }
        } catch (error) {
            setFormErrors({ submit: 'Failed to submit issue. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveAttachment = () => {
        setFormData(prev => ({
            ...prev,
            attachment: null
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <form className="issue-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="issueType">Issue Type *</label>
                <select 
                    id="issueType" 
                    name="issue_type"
                    className={`form-select ${formErrors.issue_type ? 'error' : ''}`}
                    value={formData.issue_type}
                    onChange={handleInputChange}
                    disabled={loading || isSubmitting}
                >
                    {issueTypes.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {formErrors.issue_type && (
                    <span className="error-message">{formErrors.issue_type}</span>
                )}
            </div>
            
            <div className="form-group">
                <label htmlFor="issueDescription">Description *</label>
                <textarea 
                    id="issueDescription" 
                    name="message"
                    className={`form-textarea ${formErrors.message ? 'error' : ''}`}
                    placeholder="Describe your issue in detail. Include order numbers, locations, and any relevant information..."
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={loading || isSubmitting}
                />
                {formErrors.message && (
                    <span className="error-message">{formErrors.message}</span>
                )}
                <div className="char-count">
                    {formData.message.length} characters
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="orderId">Order ID (Optional)</label>
                <input 
                    type="text" 
                    id="orderId" 
                    name="order_id"
                    className="form-input"
                    placeholder="e.g., ORD-12345"
                    value={formData.order_id}
                    onChange={handleInputChange}
                    disabled={loading || isSubmitting}
                />
                <div className="input-hint">
                    Include if issue is related to a specific order
                </div>
            </div>
            
            <div className="form-group">
                <label>Attachment (Optional)</label>
                <div className="file-upload">
                    <input 
                        type="file" 
                        id="issueAttachment" 
                        ref={fileInputRef}
                        className="file-input"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        disabled={loading || isSubmitting}
                    />
                    <label htmlFor="issueAttachment" className="file-label">
                        <i data-lucide="paperclip"></i>
                        <span>
                            {formData.attachment 
                                ? formData.attachment.name 
                                : 'Attach File (JPG, PNG, PDF up to 5MB)'
                            }
                        </span>
                    </label>
                    {formData.attachment && (
                        <button 
                            type="button"
                            className="remove-file-btn"
                            onClick={handleRemoveAttachment}
                            disabled={loading || isSubmitting}
                        >
                            <i data-lucide="x"></i>
                        </button>
                    )}
                </div>
            </div>
            
            {formErrors.submit && (
                <div className="submit-error">
                    <i data-lucide="alert-circle"></i>
                    <span>{formErrors.submit}</span>
                </div>
            )}
            
            <button 
                type="submit" 
                className="btn-primary submit-btn"
                disabled={loading || isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <div className="submit-spinner"></div>
                        Submitting...
                    </>
                ) : (
                    <>
                        <i data-lucide="send"></i>
                        Submit Report
                    </>
                )}
            </button>
        </form>
    );
};

export default IssueForm;