import React, { useState, useEffect } from 'react';
import { useDeliveryPersonContext } from '../../../../context/DeliveryPersonContext';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Car, Bike, Shield, Check, X, Package, DollarSign,
  Upload, FileText, CreditCard, UserCheck
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './DeliveryPersonForm.css';

const DeliveryPersonForm = ({ mode = 'create' }) => {
    const { deliveryPersonId } = useParams();
    const { 
        currentDeliveryPerson, 
        loading, 
        error, 
        successMessage, 
        fetchDeliveryPersonById, 
        registerDeliveryPerson,
        updateDeliveryPersonStatus,
        clearError, 
        clearSuccessMessage 
    } = useDeliveryPersonContext();
    
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        user_id: '',
        license_number: '',
        vehicle_type: 'BIKE',
        vehicle_number: '',
        status: 'PENDING'
    });

    const [documents, setDocuments] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (mode === 'edit' && deliveryPersonId) {
            fetchDeliveryPersonById(deliveryPersonId);
        }
    }, [mode, deliveryPersonId, fetchDeliveryPersonById]);

    useEffect(() => {
        if (mode === 'edit' && currentDeliveryPerson) {
            setFormData({
                user_id: currentDeliveryPerson.user_id || '',
                license_number: currentDeliveryPerson.license_number || '',
                vehicle_type: currentDeliveryPerson.vehicle_type || 'BIKE',
                vehicle_number: currentDeliveryPerson.vehicle_number || '',
                status: currentDeliveryPerson.status || 'PENDING'
            });
        }
    }, [currentDeliveryPerson, mode]);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.user_id) errors.user_id = 'User ID is required';
        if (!formData.license_number) errors.license_number = 'License number is required';
        if (!formData.vehicle_number) errors.vehicle_number = 'Vehicle number is required';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        if (mode === 'create') {
            const result = await registerDeliveryPerson(formData);
            if (result.success) {
                setTimeout(() => {
                    navigate('/admin/users/delivery-persons');
                }, 1500);
            }
        } else if (mode === 'edit' && deliveryPersonId) {
            if (formData.status !== currentDeliveryPerson?.status) {
                const result = await updateDeliveryPersonStatus(deliveryPersonId, formData.status);
                if (result.success) {
                    setTimeout(() => {
                        navigate('/admin/users/delivery-persons');
                    }, 1500);
                }
            } else {
                // No status change, just navigate back
                navigate('/admin/users/delivery-persons');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        const newDocuments = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            uploaded_at: new Date().toISOString()
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
    };

    const removeDocument = (id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    const vehicleTypes = [
        { value: 'BIKE', label: 'Bike', icon: <Bike size={16} /> },
        { value: 'MOTORCYCLE', label: 'Motorcycle', icon: <Bike size={16} /> },
        { value: 'CAR', label: 'Car', icon: <Car size={16} /> },
        { value: 'SCOOTER', label: 'Scooter', icon: <Bike size={16} /> },
        { value: 'WALKING', label: 'Walking', icon: <User size={16} /> }
    ];

    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: '#ef6c00' },
        { value: 'ACTIVE', label: 'Active', color: '#2e7d32' },
        { value: 'INACTIVE', label: 'Inactive', color: '#c62828' },
        { value: 'SUSPENDED', label: 'Suspended', color: '#757575' }
    ];

    // Helper function to safely parse rating
    const getRatingValue = (rating) => {
        if (!rating && rating !== 0) return 'N/A';
        const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
        return isNaN(numRating) ? 'N/A' : numRating.toFixed(1);
    };

    // Helper function to safely format earnings
    const getEarningsValue = (earnings) => {
        if (!earnings && earnings !== 0) return '0.00';
        const numEarnings = typeof earnings === 'string' ? parseFloat(earnings) : earnings;
        return isNaN(numEarnings) ? '0.00' : numEarnings.toFixed(2);
    };

    return (
        <div className="delivery-person-form-container">
            <div className="form-header">
                <h1>{mode === 'edit' ? 'Edit Delivery Person' : 'Register Delivery Person'}</h1>
                <p>{mode === 'edit' ? 'Update delivery person information' : 'Register a new delivery person'}</p>
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

            <form onSubmit={handleSubmit} className="delivery-person-form">
                <div className="form-section">
                    <h3><User size={18} /> Basic Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="user_id">User ID *</label>
                            <div className="input-with-icon">
                                <User size={18} />
                                <input
                                    type="number"
                                    id="user_id"
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    placeholder="Enter user ID"
                                    className={formErrors.user_id ? 'error' : ''}
                                    disabled={mode === 'edit'}
                                />
                            </div>
                            {formErrors.user_id && (
                                <span className="error-message">{formErrors.user_id}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="license_number">License Number *</label>
                            <div className="input-with-icon">
                                <UserCheck size={18} />
                                <input
                                    type="text"
                                    id="license_number"
                                    name="license_number"
                                    value={formData.license_number}
                                    onChange={handleChange}
                                    placeholder="DL-123456789"
                                    className={formErrors.license_number ? 'error' : ''}
                                />
                            </div>
                            {formErrors.license_number && (
                                <span className="error-message">{formErrors.license_number}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="vehicle_type">Vehicle Type</label>
                            <div className="vehicle-options">
                                {vehicleTypes.map(vehicle => (
                                    <label key={vehicle.value} className="vehicle-option">
                                        <input
                                            type="radio"
                                            name="vehicle_type"
                                            value={vehicle.value}
                                            checked={formData.vehicle_type === vehicle.value}
                                            onChange={handleChange}
                                        />
                                        <span className="vehicle-icon">{vehicle.icon}</span>
                                        <span>{vehicle.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="vehicle_number">Vehicle Number *</label>
                            <div className="input-with-icon">
                                <Car size={18} />
                                <input
                                    type="text"
                                    id="vehicle_number"
                                    name="vehicle_number"
                                    value={formData.vehicle_number}
                                    onChange={handleChange}
                                    placeholder="KA-01-AB-1234"
                                    className={formErrors.vehicle_number ? 'error' : ''}
                                />
                            </div>
                            {formErrors.vehicle_number && (
                                <span className="error-message">{formErrors.vehicle_number}</span>
                            )}
                        </div>
                    </div>
                </div>

                {mode === 'create' && (
                    <div className="form-section">
                        <h3><Shield size={18} /> Documents & Verification</h3>
                        <div className="documents-upload">
                            <div className="upload-area">
                                <Upload size={24} />
                                <p>Upload required documents</p>
                                <span className="upload-hint">License, ID proof, vehicle registration, etc.</span>
                                <input
                                    type="file"
                                    id="documents"
                                    multiple
                                    onChange={handleDocumentUpload}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                                <label htmlFor="documents" className="upload-btn">
                                    Choose Files
                                </label>
                            </div>

                            {documents.length > 0 && (
                                <div className="documents-list">
                                    <h4>Uploaded Documents</h4>
                                    {documents.map(doc => (
                                        <div key={doc.id} className="document-item">
                                            <FileText size={16} />
                                            <div className="document-info">
                                                <span className="document-name">{doc.name}</span>
                                                <span className="document-size">
                                                    {(doc.size / 1024).toFixed(2)} KB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-doc"
                                                onClick={() => removeDocument(doc.id)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="form-section">
                    <h3><Calendar size={18} /> Account Status</h3>
                    <div className="status-options">
                        {statusOptions.map(status => (
                            <label key={status.value} className="status-option">
                                <input
                                    type="radio"
                                    name="status"
                                    value={status.value}
                                    checked={formData.status === status.value}
                                    onChange={handleChange}
                                />
                                <span 
                                    className="status-indicator" 
                                    style={{ backgroundColor: status.color }}
                                />
                                <span className="status-label">{status.label}</span>
                            </label>
                        ))}
                    </div>

                    {mode === 'edit' && currentDeliveryPerson && (
                        <div className="current-stats">
                            <h4>Current Performance</h4>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <Package size={16} />
                                    <div>
                                        <span className="stat-value">
                                            {currentDeliveryPerson.total_deliveries || 0}
                                        </span>
                                        <span className="stat-label">Deliveries</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <DollarSign size={16} />
                                    <div>
                                        <span className="stat-value">
                                            ${getEarningsValue(currentDeliveryPerson.total_earnings)}
                                        </span>
                                        <span className="stat-label">Earnings</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <Shield size={16} />
                                    <div>
                                        <span className="stat-value">
                                            {getRatingValue(currentDeliveryPerson.rating)}
                                        </span>
                                        <span className="stat-label">Rating</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/admin/users/delivery-persons')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : mode === 'edit' ? 'Update Delivery Person' : 'Register Delivery Person'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DeliveryPersonForm;