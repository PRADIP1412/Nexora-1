import React, { useState } from 'react';
import './ProfileDetails.css';

const ProfileDetails = ({ personalInfo, loading, getFullName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        address: '',
        joining_date: ''
    });

    React.useEffect(() => {
        if (personalInfo) {
            setFormData({
                first_name: personalInfo.first_name || '',
                last_name: personalInfo.last_name || '',
                email: personalInfo.email || '',
                phone_number: personalInfo.phone_number || '',
                date_of_birth: personalInfo.date_of_birth || '',
                address: personalInfo.address || '',
                joining_date: personalInfo.joining_date || ''
            });
        }
    }, [personalInfo]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (personalInfo) {
            setFormData({
                first_name: personalInfo.first_name || '',
                last_name: personalInfo.last_name || '',
                email: personalInfo.email || '',
                phone_number: personalInfo.phone_number || '',
                date_of_birth: personalInfo.date_of_birth || '',
                address: personalInfo.address || '',
                joining_date: personalInfo.joining_date || ''
            });
        }
    };

    const handleSave = () => {
        // Save logic here
        console.log('Saving data:', formData);
        setIsEditing(false);
        // Call API to update
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    if (loading && !personalInfo) {
        return (
            <div className="personal-info-card loading">
                <div className="card-header">
                    <h3>Personal Information</h3>
                </div>
                <div className="loading-content">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="personal-info-card">
            <div className="card-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                    <button className="btn-text" onClick={handleEdit}>
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                ) : (
                    <div className="edit-actions">
                        <button className="btn-text cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button className="btn-text save" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                )}
            </div>
            <div className="info-grid">
                <div className="info-item">
                    <span className="info-label">Full Name</span>
                    {isEditing ? (
                        <div className="name-fields">
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="edit-input"
                                placeholder="First Name"
                            />
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="edit-input"
                                placeholder="Last Name"
                            />
                        </div>
                    ) : (
                        <span className="info-value">{getFullName()}</span>
                    )}
                </div>
                <div className="info-item">
                    <span className="info-label">Email</span>
                    {isEditing ? (
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    ) : (
                        <span className="info-value">{personalInfo?.email || 'N/A'}</span>
                    )}
                </div>
                <div className="info-item">
                    <span className="info-label">Phone Number</span>
                    {isEditing ? (
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    ) : (
                        <span className="info-value">{personalInfo?.phone_number || 'N/A'}</span>
                    )}
                </div>
                <div className="info-item">
                    <span className="info-label">Date of Birth</span>
                    {isEditing ? (
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    ) : (
                        <span className="info-value">{personalInfo?.date_of_birth || 'N/A'}</span>
                    )}
                </div>
                <div className="info-item">
                    <span className="info-label">Address</span>
                    {isEditing ? (
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="edit-textarea"
                            rows="3"
                        />
                    ) : (
                        <span className="info-value">{personalInfo?.address || 'N/A'}</span>
                    )}
                </div>
                <div className="info-item">
                    <span className="info-label">Joining Date</span>
                    <span className="info-value">{personalInfo?.joining_date || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;