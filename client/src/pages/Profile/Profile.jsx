import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { toastSuccess, toastError, toastWarning, toastInfo } from '../../utils/customToast';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';
import { toast } from 'react-toastify';
 
const Profile = () => {
    const navigate = useNavigate();
    const { logout, isAuthenticated } = useAuth();
    const { profile, stats, loading, updateProfile, changePassword, fetchProfile } = useProfile();
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    // Form data matching backend field names
    const [editData, setEditData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        gender: '',
        dob: '',
        profile_img_url: null
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Toast configuration
    const toastConfig = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Populate form when profile loads
    useEffect(() => {
        if (profile) {
            setEditData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone: profile.phone || '',
                gender: profile.gender || '',
                dob: profile.dob || '',
                profile_img_url: profile.profile_img_url || null
            });
        }
    }, [profile]);

    const handleEdit = () => {
        setIsEditing(true);
        toastInfo('You can now edit your profile information', toastConfig);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (profile) {
            setEditData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone: profile.phone || '',
                gender: profile.gender || '',
                dob: profile.dob || '',
                profile_img_url: profile.profile_img_url || null
            });
        }
        toastInfo('Changes discarded', toastConfig);
    };

    const handleSave = async () => {
        // Validate required fields
        if (!editData.first_name || !editData.last_name) {
            toastError('First name and last name are required', toastConfig);
            return;
        }

        setSaving(true);
        try {
            await updateProfile(editData);
            setIsEditing(false);
            toastSuccess('Profile updated successfully!', toastConfig);
        } catch (error) {
            toastError(error.message || 'Failed to update profile', toastConfig);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async () => {
        if (!passwordData.currentPassword) {
            toastError('Please enter your current password', toastConfig);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toastError('Password must be at least 8 characters long!', toastConfig);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toastError('Passwords do not match!', toastConfig);
            return;
        }

        setSaving(true);
        try {
            await changePassword(passwordData);
            toastSuccess('Password changed successfully!', toastConfig);
            setShowPasswordChange(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toastError(error.message || 'Failed to change password', toastConfig);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toastError('Please select a valid image file', toastConfig);
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toastError('Image size should be less than 5MB', toastConfig);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData(prev => ({
                    ...prev,
                    profile_img_url: reader.result
                }));
                toastSuccess('Profile picture updated!', toastConfig);
            };
            reader.onerror = () => {
                toastError('Failed to read image file', toastConfig);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        toastInfo(
            <div>
                <p>Are you sure you want to logout?</p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => {
                            toast.dismiss();
                            logout();
                            navigate('/login');
                            toastSuccess('Logged out successfully!', toastConfig);
                        }}
                        style={{
                            padding: '5px 15px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Yes, Logout
                    </button>
                    <button 
                        onClick={() => toast.dismiss()}
                        style={{
                            padding: '5px 15px',
                            background: '#e0e0e0',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                ...toastConfig,
                autoClose: false,
                closeOnClick: false,
            }
        );
    };

    const handleQuickLinkClick = (path, name) => {
        toastInfo(`Navigating to ${name}`);
        navigate(path);
    };

    const handleStatCardClick = (path, name) => {
        toastInfo(`Viewing ${name}`);
        navigate(path);
    };

    // Show loading while checking authentication or fetching profile
    if (!isAuthenticated || (loading && !profile)) {
        return (
            <div className="profile-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile && !loading) {
        return (
            <div className="profile-page">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load profile</h3>
                    <p>Please try refreshing the page</p>
                    <button 
                        className="btn-retry" 
                        onClick={() => fetchProfile()}
                    >
                        <i className="fas fa-redo"></i>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const fullName = profile ? `${profile.first_name} ${profile.last_name || ''}`.trim() : '';

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                {editData.profile_img_url ? (
                                    <img src={editData.profile_img_url} alt="Profile" className="avatar-image" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <i className="fas fa-user"></i>
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="avatar-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            hidden
                                        />
                                        <i className="fas fa-camera"></i>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="profile-info">
                            <h1>{fullName}</h1>
                            <p className="profile-email">{profile?.email}</p>
                            <div className="profile-badges">
                                {profile?.is_verified && (
                                    <span className="badge verified">
                                        <i className="fas fa-check-circle"></i> Verified
                                    </span>
                                )}
                                {profile?.is_active && (
                                    <span className="badge active">
                                        <i className="fas fa-circle"></i> Active
                                    </span>
                                )}
                            </div>
                            <p className="profile-joined">
                                <i className="fas fa-calendar-alt"></i>
                                Member since {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                            </p>
                        </div>

                        <div className="profile-actions">
                            {!isEditing ? (
                                <button className="btn-edit" onClick={handleEdit}>
                                    <i className="fas fa-edit"></i>
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        <i className="fas fa-check"></i>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button className="btn-cancel" onClick={handleCancel} disabled={saving}>
                                        <i className="fas fa-times"></i>
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card" onClick={() => handleStatCardClick('/orders', 'Orders')}>
                        <div className="stat-icon orders">
                            <i className="fas fa-shopping-bag"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.total_orders || 0}</h3>
                            <p>Total Orders</p>
                        </div>
                    </div>

                    <div className="stat-card" onClick={() => handleStatCardClick('/orders?status=active', 'Active Orders')}>
                        <div className="stat-icon active">
                            <i className="fas fa-truck"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.active_orders || 0}</h3>
                            <p>Active Orders</p>
                        </div>
                    </div>

                    <div className="stat-card" onClick={() => handleStatCardClick('/wishlist', 'Wishlist')}>
                        <div className="stat-icon wishlist">
                            <i className="fas fa-heart"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.wishlist_items || 0}</h3>
                            <p>Wishlist Items</p>
                        </div>
                    </div>

                    <div className="stat-card" onClick={() => toastInfo(`Total spent: ₹${stats?.total_spent?.toLocaleString() || '0'}`)}>
                        <div className="stat-icon spent">
                            <i className="fas fa-wallet"></i>
                        </div>
                        <div className="stat-info">
                            <h3>₹{stats?.total_spent?.toLocaleString() || '0'}</h3>
                            <p>Total Spent</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="profile-tabs">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('personal');
                                toastInfo('Viewing personal information');
                            }}
                        >
                            <i className="fas fa-user"></i>
                            Personal Information
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('security');
                                toastInfo('Viewing security settings');
                            }}
                        >
                            <i className="fas fa-lock"></i>
                            Security
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'personal' && (
                            <div className="personal-tab">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            value={profile?.username || ''}
                                            disabled={true}
                                            className="disabled-field"
                                        />
                                        <small className="field-hint">Username cannot be changed</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            disabled={true}
                                            className="disabled-field"
                                        />
                                        <small className="field-hint">Email cannot be changed</small>
                                    </div>

                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={isEditing ? editData.first_name : (profile?.first_name || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={isEditing ? editData.last_name : (profile?.last_name || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={isEditing ? editData.phone : (profile?.phone || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="+91 1234567890"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select
                                            name="gender"
                                            value={isEditing ? editData.gender : (profile?.gender || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={isEditing ? editData.dob : (profile?.dob || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="security-tab">
                                <div className="security-section">
                                    <div className="section-header">
                                        <div>
                                            <h3>Password</h3>
                                            <p>Manage your password and security settings</p>
                                        </div>
                                        {!showPasswordChange && (
                                            <button 
                                                className="btn-change-password" 
                                                onClick={() => {
                                                    setShowPasswordChange(true);
                                                    toastInfo('You can now change your password');
                                                }}
                                            >
                                                <i className="fas fa-key"></i>
                                                Change Password
                                            </button>
                                        )}
                                    </div>

                                    {showPasswordChange && (
                                        <div className="password-change-form">
                                            <div className="form-group">
                                                <label>Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Enter current password"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Enter new password (min 8 characters)"
                                                />
                                                <small className="field-hint">Minimum 8 characters required</small>
                                            </div>

                                            <div className="form-group">
                                                <label>Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Confirm new password"
                                                />
                                            </div>

                                            <div className="password-actions">
                                                <button 
                                                    className="btn-submit-password" 
                                                    onClick={handlePasswordSubmit} 
                                                    disabled={saving}
                                                >
                                                    <i className="fas fa-check"></i>
                                                    {saving ? 'Updating...' : 'Update Password'}
                                                </button>
                                                <button 
                                                    className="btn-cancel-password" 
                                                    onClick={() => {
                                                        setShowPasswordChange(false);
                                                        setPasswordData({
                                                            currentPassword: '',
                                                            newPassword: '',
                                                            confirmPassword: ''
                                                        });
                                                        toastInfo('Password change cancelled');
                                                    }}
                                                    disabled={saving}
                                                >
                                                    <i className="fas fa-times"></i>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="security-section">
                                    <div className="section-header">
                                        <div>
                                            <h3>Account Status</h3>
                                            <p>Your account information</p>
                                        </div>
                                    </div>
                                    <div className="account-info">
                                        <div className="info-row">
                                            <span className="info-label">Last Login:</span>
                                            <span className="info-value">
                                                {profile?.last_login 
                                                    ? new Date(profile.last_login).toLocaleString()
                                                    : 'Never'}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Account Status:</span>
                                            <span className={`info-value ${profile?.is_active ? 'status-active' : 'status-inactive'}`}>
                                                {profile?.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Email Verification:</span>
                                            <span className={`info-value ${profile?.is_verified ? 'status-verified' : 'status-unverified'}`}>
                                                {profile?.is_verified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="security-section danger-zone">
                                    <div className="section-header">
                                        <div>
                                            <h3>Danger Zone</h3>
                                            <p>Irreversible actions</p>
                                        </div>
                                        <button className="btn-logout" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt"></i>
                                            Logout from Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="quick-links">
                    <h3>Quick Links</h3>
                    <div className="links-grid">
                        <div className="link-card" onClick={() => handleQuickLinkClick('/orders', 'My Orders')}>
                            <i className="fas fa-box"></i>
                            <span>My Orders</span>
                            <small>{stats?.total_orders || 0} orders</small>
                        </div>
                        <div className="link-card" onClick={() => handleQuickLinkClick('/addresses', 'Addresses')}>
                            <i className="fas fa-map-marker-alt"></i>
                            <span>Addresses</span>
                            <small>{stats?.saved_addresses || 0} saved</small>
                        </div>
                        <div className="link-card" onClick={() => handleQuickLinkClick('/wishlist', 'Wishlist')}>
                            <i className="fas fa-heart"></i>
                            <span>Wishlist</span>
                            <small>{stats?.wishlist_items || 0} items</small>
                        </div>
                        <div className="link-card" onClick={() => handleQuickLinkClick('/reviews', 'My Reviews')}>
                            <i className="fas fa-star"></i>
                            <span>My Reviews</span>
                            <small>{stats?.reviews || 0} reviews</small>
                        </div>
                        <div className="link-card" onClick={() => handleQuickLinkClick('/cart', 'Shopping Cart')}>
                            <i className="fas fa-shopping-cart"></i>
                            <span>Cart</span>
                            <small>{stats?.cart_items || 0} items</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;