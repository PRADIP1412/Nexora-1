import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountContext } from '../../context/AccountContext'; // ✅ Fixed import
import { useAuth } from '../../context/AuthContext';
import { toastSuccess, toastError, toastInfo } from '../../utils/customToast';
import './Account.css';

const Account = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const { dashboard, loading, error, fetchDashboard } = useAccountContext(); // ✅ Note: changed refetchDashboard to fetchDashboard
    const { user: authUser } = useAuth();
    const navigate = useNavigate();

    // Toast configuration
    const toastConfig = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    // Handle input changes for profile data
    const handleInputChange = (field, value) => {
        toastInfo('Edit functionality requires update API implementation', toastConfig);
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toastError('New passwords do not match', toastConfig);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toastError('Password must be at least 6 characters long', toastConfig);
            return;
        }

        if (!passwordData.currentPassword) {
            toastError('Please enter your current password', toastConfig);
            return;
        }

        try {
            // Implement your password change API call here
            // await accountAPI.changePassword(passwordData);
            toastSuccess('Password changed successfully!', toastConfig);
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toastError('Failed to change password. Please try again.', toastConfig);
        }
    };

    // Handle profile update
    const handleSave = async () => {
        try {
            // Implement your profile update API call here
            // await accountAPI.updateProfile(updatedData);
            toastSuccess('Profile updated successfully!', toastConfig);
            setIsEditing(false);
            fetchDashboard(); // Refresh dashboard data - ✅ Changed refetchDashboard to fetchDashboard
        } catch (error) {
            toastError('Failed to update profile. Please try again.', toastConfig);
        }
    };

    // Quick action handlers
    const handleQuickAction = (action) => {
        switch (action) {
            case 'profile':
                navigate('/profile');
                toastInfo('Navigating to profile', toastConfig);
                break;
            case 'orders':
                navigate('/orders');
                toastInfo('Navigating to orders', toastConfig);
                break;
            case 'wishlist':
                navigate('/wishlist');
                toastInfo('Navigating to wishlist', toastConfig);
                break;
            case 'support':
                navigate('/support');
                toastInfo('Navigating to support', toastConfig);
                break;
            default:
                toastInfo(`Navigating to ${action}`, toastConfig);
        }
    };

    // Get user data from dashboard or auth context
    const getUserData = () => {
        if (dashboard?.overview) {
            return {
                first_name: dashboard.overview.name?.split(' ')[0] || 'User',
                last_name: dashboard.overview.name?.split(' ').slice(1).join(' ') || '',
                email: dashboard.overview.email || '',
                membership_tier: dashboard.overview.membership_tier || 'Standard',
                status: dashboard.overview.account_status || 'Active',
                join_date: dashboard.overview.joined_date || new Date().toISOString(),
                phone: ''
            };
        }
        // Fallback to auth user data
        return {
            first_name: authUser?.first_name || authUser?.firstname || 'User',
            last_name: authUser?.last_name || authUser?.lastname || '',
            email: authUser?.email || '',
            membership_tier: 'Standard',
            status: 'Active',
            join_date: authUser?.created_at || authUser?.joined_date || new Date().toISOString(),
            phone: authUser?.phone || ''
        };
    };

    const userData = getUserData();
    const fullName = `${userData.first_name} ${userData.last_name}`.trim() || 'User';

    if (loading) {
        return (
            <div className="account-page">
                <div className="account-container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading your account...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="account-page">
                <div className="account-container">
                    <div className="error-container">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Unable to load account data</h3>
                        <p>{error}</p>
                        <button onClick={fetchDashboard} className="btn-retry"> {/* ✅ Changed refetchDashboard to fetchDashboard */}
                            <i className="fas fa-redo"></i>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="account-page">
            <div className="account-container">
                {/* Account Header */}
                <div className="account-header">
                    <div className="account-header-content">
                        <div className="account-avatar-section">
                            <div className="account-avatar-wrapper">
                                <div className="account-avatar-placeholder">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div className={`account-status-indicator ${userData.status?.toLowerCase() || 'active'}`}></div>
                            </div>
                        </div>
                        
                        <div className="account-info">
                            <h1>{fullName}</h1>
                            <p className="account-email">{userData.email}</p>
                            <div className="account-meta">
                                <span className="account-membership">{userData.membership_tier || 'Standard'}</span>
                                <span className={`account-status ${userData.status?.toLowerCase() || 'active'}`}>
                                    {userData.status || 'Active'}
                                </span>
                                <span className="account-join-date">
                                    Member since {new Date(userData.join_date).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                        </div>
                        
                        <div className="account-actions">
                            <button 
                                className="btn-view-profile"
                                onClick={() => handleQuickAction('profile')}
                            >
                                <i className="fas fa-user-circle"></i>
                                View Profile
                            </button>
                            <button 
                                className={`btn-edit-account ${isEditing ? 'editing' : ''}`}
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    if (!isEditing) {
                                        toastInfo('You can now edit your account information', toastConfig);
                                    } else {
                                        toastInfo('Edit mode cancelled', toastConfig);
                                    }
                                }}
                            >
                                <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'}`}></i>
                                {isEditing ? 'Cancel' : 'Edit Account'}
                            </button>
                            {isEditing && (
                                <button className="btn-save-account" onClick={handleSave}>
                                    <i className="fas fa-save"></i>
                                    Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="account-navigation">
                    <button 
                        className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('overview');
                            toastInfo('Viewing account overview', toastConfig);
                        }}
                    >
                        <i className="fas fa-chart-pie"></i>
                        Overview
                    </button>
                    <button 
                        className={`nav-btn ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('settings');
                            toastInfo('Viewing account settings', toastConfig);
                        }}
                    >
                        <i className="fas fa-cog"></i>
                        Settings
                    </button>
                    <button 
                        className={`nav-btn ${activeSection === 'billing' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('billing');
                            toastInfo('Viewing billing information', toastConfig);
                        }}
                    >
                        <i className="fas fa-credit-card"></i>
                        Billing
                    </button>
                    <button 
                        className={`nav-btn ${activeSection === 'security' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('security');
                            toastInfo('Viewing security settings', toastConfig);
                        }}
                    >
                        <i className="fas fa-shield-alt"></i>
                        Security
                    </button>
                </div>

                {/* Main Content */}
                <div className="account-content">
                    {activeSection === 'overview' && (
                        <div className="overview-section">
                            {/* Stats Grid */}
                            <div className="account-stats-grid">
                                <div className="account-stat-card" onClick={() => handleQuickAction('orders')}>
                                    <div className="account-stat-icon orders">
                                        <i className="fas fa-shopping-bag"></i>
                                    </div>
                                    <div className="account-stat-info">
                                        <h3>{dashboard?.stats?.total_orders || 0}</h3>
                                        <p>Total Orders</p>
                                    </div>
                                </div>
                                
                                <div className="account-stat-card" onClick={() => handleQuickAction('orders')}>
                                    <div className="account-stat-icon pending">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div className="account-stat-info">
                                        <h3>{dashboard?.stats?.pending_orders || 0}</h3>
                                        <p>Pending Orders</p>
                                    </div>
                                </div>
                                
                                <div className="account-stat-card">
                                    <div className="account-stat-icon spent">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                    <div className="account-stat-info">
                                        <h3>${(dashboard?.stats?.total_spent || 0).toLocaleString()}</h3>
                                        <p>Total Spent</p>
                                    </div>
                                </div>
                                
                                <div className="account-stat-card">
                                    <div className="account-stat-icon points">
                                        <i className="fas fa-gem"></i>
                                    </div>
                                    <div className="account-stat-info">
                                        <h3>{dashboard?.stats?.loyalty_points || 0}</h3>
                                        <p>Loyalty Points</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="recent-activity">
                                <h3>Recent Activity</h3>
                                <div className="activity-list">
                                    {dashboard?.recent_activities && dashboard.recent_activities.length > 0 ? (
                                        dashboard.recent_activities.map(activity => (
                                            <div key={activity.id} className="activity-item">
                                                <div className="activity-icon">
                                                    {getActivityIcon(activity.activity_type)}
                                                </div>
                                                <div className="activity-content">
                                                    <h4>{activity.title}</h4>
                                                    <p>{activity.description}</p>
                                                </div>
                                                <div className="activity-date">
                                                    {formatActivityDate(activity.timestamp)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-activities">
                                            <i className="fas fa-inbox"></i>
                                            <p>No recent activities</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="settings-section">
                            <div className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={userData.first_name || ''}
                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={userData.last_name || ''}
                                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={userData.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={userData.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                
                                <div className="preferences-section">
                                    <h4>Notification Preferences</h4>
                                    {dashboard?.preferences ? (
                                        Object.entries(dashboard.preferences).map(([key, value]) => (
                                            <div key={key} className="preference-item">
                                                <div className="preference-info">
                                                    <h5>{formatPreferenceKey(key)}</h5>
                                                    <p>{getPreferenceDescription(key)}</p>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={value} 
                                                        onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                                                        disabled={!isEditing}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-preferences">
                                            <p>No preferences available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'billing' && (
                        <div className="billing-section">
                            <div className="billing-card">
                                <h4>Billing Information</h4>
                                <div className="billing-info">
                                    <p><strong>Plan:</strong> {userData.membership_tier || 'Standard'}</p>
                                    <p><strong>Billing Cycle:</strong> Monthly</p>
                                    <p><strong>Next Billing Date:</strong> {getNextBillingDate()}</p>
                                </div>
                                <button className="btn-upgrade-plan">
                                    <i className="fas fa-crown"></i>
                                    Upgrade Plan
                                </button>
                            </div>
                            
                            <div className="billing-history">
                                <h4>Billing History</h4>
                                <div className="invoice-list">
                                    <div className="no-invoices">
                                        <i className="fas fa-receipt"></i>
                                        <p>No billing history available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="security-section">
                            <div className="security-card">
                                <h4>Security Settings</h4>
                                
                                <div className="security-item">
                                    <div className="security-info">
                                        <h5>Password</h5>
                                        <p>Last changed {getLastPasswordChange()}</p>
                                    </div>
                                    <button 
                                        className="btn-change-password"
                                        onClick={() => {
                                            setIsChangingPassword(true);
                                            toastInfo('You can now change your password', toastConfig);
                                        }}
                                    >
                                        Change Password
                                    </button>
                                </div>
                                
                                {isChangingPassword && (
                                    <div className="password-change-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    currentPassword: e.target.value
                                                }))}
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    newPassword: e.target.value
                                                }))}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    confirmPassword: e.target.value
                                                }))}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <div className="password-actions">
                                            <button 
                                                className="btn-submit-password"
                                                onClick={handlePasswordChange}
                                            >
                                                Update Password
                                            </button>
                                            <button 
                                                className="btn-cancel-password"
                                                onClick={() => {
                                                    setIsChangingPassword(false);
                                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                    toastInfo('Password change cancelled', toastConfig);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="security-item">
                                    <div className="security-info">
                                        <h5>Two-Factor Authentication</h5>
                                        <p>Add an extra layer of security to your account</p>
                                    </div>
                                    <button className="btn-enable-2fa">
                                        Enable 2FA
                                    </button>
                                </div>
                                
                                <div className="security-item">
                                    <div className="security-info">
                                        <h5>Active Sessions</h5>
                                        <p>Manage your active login sessions</p>
                                    </div>
                                    <button className="btn-view-sessions">
                                        View Sessions
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <button 
                            className="action-card" 
                            onClick={() => handleQuickAction('profile')}
                        >
                            <i className="fas fa-user-edit"></i>
                            <span>Edit Profile</span>
                        </button>
                        
                        <button 
                            className="action-card"
                            onClick={() => handleQuickAction('orders')}
                        >
                            <i className="fas fa-shopping-cart"></i>
                            <span>View Orders</span>
                        </button>
                        
                        <button 
                            className="action-card"
                            onClick={() => handleQuickAction('wishlist')}
                        >
                            <i className="fas fa-heart"></i>
                            <span>Wishlist</span>
                        </button>
                        
                        <button 
                            className="action-card"
                            onClick={() => handleQuickAction('support')}
                        >
                            <i className="fas fa-question-circle"></i>
                            <span>Support</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getActivityIcon = (type) => {
    const icons = {
        order: '🛒',
        profile: '👤',
        security: '🔒',
        payment: '💳',
        login: '🔑',
        review: '⭐',
        wishlist: '❤️'
    };
    return icons[type] || '📝';
};

const formatActivityDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
};

const formatPreferenceKey = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getPreferenceDescription = (key) => {
    const descriptions = {
        email_notifications: 'Receive updates about your account via email',
        sms_notifications: 'Get important alerts via text message',
        newsletter: 'Receive our weekly newsletter with updates and offers',
        marketing_emails: 'Get notified about special offers and promotions'
    };
    return descriptions[key] || 'Manage your notification preferences';
};

const getNextBillingDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString();
};

const getLastPasswordChange = () => {
    // This would come from your backend
    return '2 weeks ago';
};

const handlePreferenceChange = (key, value) => {
    // Implement preference update logic
    toastInfo('Preference update functionality requires API implementation', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

export default Account;