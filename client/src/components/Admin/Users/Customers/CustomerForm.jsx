import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { User, Mail, Phone, Check, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './CustomerForm.css';

const CustomerForm = ({ mode = 'create' }) => {
    const { customerId } = useParams();
    const { 
        currentCustomer, 
        loading, 
        error, 
        successMessage, 
        fetchCustomerById, 
        updateCustomer, 
        clearError, 
        clearSuccessMessage 
    } = useCustomerContext();
    
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        is_active: true
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (mode === 'edit' && customerId) {
            fetchCustomerById(customerId);
        }
    }, [mode, customerId, fetchCustomerById]);

    useEffect(() => {
        if (mode === 'edit' && currentCustomer) {
            // Map backend response to form data
            setFormData({
                first_name: currentCustomer.first_name || '',
                last_name: currentCustomer.last_name || '',
                email: currentCustomer.email || '',
                phone: currentCustomer.phone || '',
                is_active: currentCustomer.is_active !== undefined ? currentCustomer.is_active : true
            });
        }
    }, [currentCustomer, mode]);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.first_name.trim()) errors.first_name = 'First name is required';
        if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        if (mode === 'edit' && customerId) {
            const result = await updateCustomer(customerId, formData);
            if (result.success) {
                setTimeout(() => {
                    navigate('/admin/users/customers');
                }, 1500);
            }
        } else if (mode === 'create') {
            // Create functionality - needs separate createCustomer API
            alert('Create functionality to be implemented with backend API');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="customer-form-container">
            <div className="form-header">
                <h1>{mode === 'edit' ? 'Edit Customer' : 'Create New Customer'}</h1>
                <p>{mode === 'edit' ? 'Update customer information' : 'Add a new customer to the system'}</p>
            </div>

            {error && (
                <div className="alert error">
                    <X size={18} />
                    <span>{error}</span>
                    <button onClick={clearError} className="alert-close">×</button>
                </div>
            )}

            {successMessage && (
                <div className="alert success">
                    <Check size={18} />
                    <span>{successMessage}</span>
                    <button onClick={clearSuccessMessage} className="alert-close">×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="customer-form">
                <div className="form-section">
                    <h3><User size={18} /> Personal Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="first_name">First Name *</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                className={formErrors.first_name ? 'error' : ''}
                            />
                            {formErrors.first_name && (
                                <span className="error-message">{formErrors.first_name}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Last Name *</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                className={formErrors.last_name ? 'error' : ''}
                            />
                            {formErrors.last_name && (
                                <span className="error-message">{formErrors.last_name}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="customer@example.com"
                                    className={formErrors.email ? 'error' : ''}
                                />
                            </div>
                            {formErrors.email && (
                                <span className="error-message">{formErrors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-with-icon">
                                <Phone size={18} />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(123) 456-7890"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Account Status</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <label htmlFor="is_active" className="checkbox-label">
                                    Active Account
                                    <span className="checkbox-description">Uncheck to deactivate this customer account</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/admin/users/customers')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : mode === 'edit' ? 'Update Customer' : 'Create Customer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;