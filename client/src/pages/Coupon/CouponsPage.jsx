import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCoupon } from '../../context/CouponContext';
import CouponList from '../../components/Coupon/CouponList';
import './CouponsPage.css';

const CouponsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { 
    activeCoupons, 
    allCoupons, 
    couponStats,
    loadAllCoupons,
    isLoading,
    error,
    deleteExistingCoupon,
    updateCouponActiveStatus,
    createNewCoupon,
    updateExistingCoupon
  } = useCoupon();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    if (isAdmin) {
      loadAllCoupons();
    }
  }, [isAdmin, loadAllCoupons]);

  const handleCouponAction = async (action, coupon) => {
    switch (action) {
      case 'apply':
        navigate('/checkout', { state: { couponCode: coupon.code } });
        break;
        
      case 'edit':
        setSelectedCoupon(coupon);
        setShowEditModal(true);
        break;
        
      case 'delete':
        if (window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
          const result = await deleteExistingCoupon(coupon.coupon_id);
          if (result.success) {
            showNotification('success', result.message);
          } else {
            showNotification('error', result.message);
          }
        }
        break;
        
      case 'toggleStatus':
        const newStatus = !coupon.is_active;
        const result = await updateCouponActiveStatus(coupon.coupon_id, newStatus);
        if (result.success) {
          showNotification('success', result.message);
        } else {
          showNotification('error', result.message);
        }
        break;
        
      case 'copied':
        showNotification('success', `Copied "${coupon}" to clipboard!`);
        break;
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  const couponsToShow = isAdmin ? allCoupons : activeCoupons;

  return (
    <div className="coupons-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-ticket-alt"></i> 
            {isAdmin ? 'Manage Coupons' : 'Available Coupons'}
          </h1>
          <p className="page-subtitle">
            {isAdmin 
              ? 'Create, edit, and manage discount coupons for your store'
              : 'Apply these coupons during checkout to save money'}
          </p>
        </div>

        {notification.message && (
          <div className={`notification ${notification.type}`}>
            <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            {notification.message}
          </div>
        )}

        {error && !isLoading && (
          <div className="error-alert">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
            <button className="retry-btn" onClick={() => loadAllCoupons()}>
              Retry
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="admin-dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h2>Coupon Dashboard</h2>
                <p className="dashboard-subtitle">
                  Manage all discount coupons from one place
                </p>
              </div>
              <button 
                className="btn-create-coupon"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus"></i> Create New Coupon
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{couponStats.total}</div>
                  <div className="stat-label">Total Coupons</div>
                </div>
              </div>

              <div className="stat-card active">
                <div className="stat-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{couponStats.active}</div>
                  <div className="stat-label">Active</div>
                </div>
              </div>

              <div className="stat-card expired">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{couponStats.expired}</div>
                  <div className="stat-label">Expired</div>
                </div>
              </div>

              <div className="stat-card upcoming">
                <div className="stat-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{couponStats.upcoming}</div>
                  <div className="stat-label">Upcoming</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="coupons-section">
          {isLoading && allCoupons.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner-large"></div>
              <p>Loading coupons...</p>
            </div>
          ) : (
            <CouponList
              coupons={couponsToShow}
              isAdmin={isAdmin}
              onCouponAction={handleCouponAction}
              emptyMessage={isAdmin ? 'No coupons created yet' : 'No coupons available at the moment'}
            />
          )}
        </div>

        {!isAuthenticated && (
          <div className="login-cta">
            <div className="cta-content">
              <h3>Want to save more?</h3>
              <p>Sign in to access exclusive member-only coupons!</p>
              <button 
                className="btn-login"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-sign-in-alt"></i> Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;