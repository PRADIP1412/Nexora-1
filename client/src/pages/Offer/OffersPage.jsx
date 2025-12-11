import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOffer } from '../../context/OfferContext';
import OfferList from '../../components/Offer/OfferList';
import './OffersPage.css';

const OffersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { 
    activeOffers, 
    allOffers, 
    offerStats,
    loadAllOffers,
    isLoading,
    error,
    deleteExistingOffer,
    updateOfferActiveStatus,
    createNewOffer,
    updateExistingOffer
  } = useOffer();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    if (isAdmin) {
      loadAllOffers();
    }
  }, [isAdmin, loadAllOffers]);

  const handleOfferSelect = (offer) => {
    navigate('/products', { 
      state: { 
        offerFilter: offer.variants || [],
        offerTitle: offer.title 
      }
    });
  };

  const handleOfferAction = async (action, offer) => {
    switch (action) {
      case 'edit':
        setSelectedOffer(offer);
        setShowEditModal(true);
        break;
        
      case 'delete':
        if (window.confirm(`Are you sure you want to delete offer "${offer.title}"?`)) {
          const result = await deleteExistingOffer(offer.offer_id);
          if (result.success) {
            showNotification('success', result.message);
          } else {
            showNotification('error', result.message);
          }
        }
        break;
        
      case 'toggleStatus':
        const newStatus = !offer.is_active;
        const result = await updateOfferActiveStatus(offer.offer_id, newStatus);
        if (result.success) {
          showNotification('success', result.message);
        } else {
          showNotification('error', result.message);
        }
        break;
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  const offersToShow = isAdmin ? allOffers : activeOffers;

  return (
    <div className="offers-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-gift"></i> 
            {isAdmin ? 'Manage Offers' : 'Special Offers'}
          </h1>
          <p className="page-subtitle">
            {isAdmin 
              ? 'Create and manage special offers for your products'
              : 'Discover amazing deals and discounts on our products'}
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
            <button className="retry-btn" onClick={() => loadAllOffers()}>
              Retry
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="admin-dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h2>Offer Dashboard</h2>
                <p className="dashboard-subtitle">
                  Manage all special offers from one place
                </p>
              </div>
              <button 
                className="btn-create-offer"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus"></i> Create New Offer
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="fas fa-gift"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{offerStats.total}</div>
                  <div className="stat-label">Total Offers</div>
                </div>
              </div>

              <div className="stat-card active">
                <div className="stat-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{offerStats.active}</div>
                  <div className="stat-label">Active</div>
                </div>
              </div>

              <div className="stat-card expired">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{offerStats.expired}</div>
                  <div className="stat-label">Expired</div>
                </div>
              </div>

              <div className="stat-card upcoming">
                <div className="stat-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{offerStats.upcoming}</div>
                  <div className="stat-label">Upcoming</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="offers-section">
          {isLoading && allOffers.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner-large"></div>
              <p>Loading offers...</p>
            </div>
          ) : (
            <OfferList
              offers={offersToShow}
              onOfferSelect={handleOfferSelect}
              emptyMessage={isAdmin ? 'No offers created yet' : 'No offers available at the moment'}
              showFilters={true}
            />
          )}
        </div>

        {!isAuthenticated && (
          <div className="signup-cta">
            <div className="cta-content">
              <h3>Don't miss out on exclusive offers!</h3>
              <p>Sign up to get notified about new deals and special promotions</p>
              <button 
                className="btn-signup"
                onClick={() => navigate('/register')}
              >
                <i className="fas fa-user-plus"></i> Sign Up Free
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;