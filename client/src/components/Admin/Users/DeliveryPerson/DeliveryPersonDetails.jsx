import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeliveryPersonContext } from '../../../../context/DeliveryPersonContext';
import { 
  User, Mail, Phone, MapPin, Calendar, DollarSign, Package, 
  ChevronLeft, Edit, Star, Clock, CheckCircle, XCircle,
  Activity, Bike, Car, Shield, Award, TrendingUp,
  FileText, AlertCircle, Download, Eye
} from 'lucide-react';
import './DeliveryPersonDetails.css';

const DeliveryPersonDetails = () => {
  const { deliveryPersonId } = useParams();
  const navigate = useNavigate();
  const { 
    currentDeliveryPerson, 
    loading, 
    error, 
    fetchDeliveryPersonById, 
    fetchDeliveryPersonStats 
  } = useDeliveryPersonContext();
  
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (deliveryPersonId) {
      fetchDeliveryPersonById(deliveryPersonId);
      loadDeliveryPersonData();
    }
  }, [deliveryPersonId]);

  const loadDeliveryPersonData = async () => {
    const statsResult = await fetchDeliveryPersonStats(deliveryPersonId);
    if (statsResult.success) setStats(statsResult.data);
    
    // Mock orders data - in a real app, you would fetch from orders API
    const mockOrders = [
      { order_id: 1001, status: 'delivered', amount: 45.99, date: '2024-01-15', items: 3 },
      { order_id: 1002, status: 'delivered', amount: 89.50, date: '2024-01-14', items: 5 },
      { order_id: 1003, status: 'in_transit', amount: 32.99, date: '2024-01-15', items: 2 },
      { order_id: 1004, status: 'pending', amount: 67.25, date: '2024-01-15', items: 4 },
    ];
    setOrders(mockOrders);
  };

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

  // Helper function to parse number safely
  const parseNumber = (value) => {
    if (!value && value !== 0) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={14} className="status-icon active" />;
      case 'INACTIVE': return <XCircle size={14} className="status-icon inactive" />;
      case 'SUSPENDED': return <AlertCircle size={14} className="status-icon suspended" />;
      case 'PENDING': return <Clock size={14} className="status-icon pending" />;
      default: return null;
    }
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType?.toLowerCase()) {
      case 'bike': return <Bike size={16} />;
      case 'car': return <Car size={16} />;
      case 'motorcycle': return <Bike size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading delivery person details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/admin/users/delivery-persons')} className="back-btn">
          <ChevronLeft size={16} /> Back to Delivery Persons
        </button>
      </div>
    );
  }

  if (!currentDeliveryPerson) {
    return (
      <div className="not-found">
        <h3>Delivery person not found</h3>
        <button onClick={() => navigate('/admin/users/delivery-persons')} className="back-btn">
          <ChevronLeft size={16} /> Back to Delivery Persons
        </button>
      </div>
    );
  }

  const ratingValue = parseNumber(currentDeliveryPerson.rating);

  return (
    <div className="delivery-person-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/admin/users/delivery-persons')}>
          <ChevronLeft size={20} /> Back to Delivery Persons
        </button>
        
        <div className="header-actions">
          <button 
            className="btn-edit" 
            onClick={() => navigate(`/admin/users/delivery-persons/edit/${deliveryPersonId}`)}
          >
            <Edit size={16} /> Edit Profile
          </button>
          <button className="btn-action">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {currentDeliveryPerson.user_name?.[0]?.toUpperCase() || 'D'}
        </div>
        <div className="profile-info">
          <div className="profile-main">
            <h1>{currentDeliveryPerson.user_name || 'Unknown'}</h1>
            <div className="profile-tags">
              <div className={`status-badge ${currentDeliveryPerson.status}`}>
                {getStatusIcon(currentDeliveryPerson.status)}
                <span>{currentDeliveryPerson.status}</span>
              </div>
              <span className="member-since">
                <Calendar size={14} /> Joined {formatDate(currentDeliveryPerson.joined_at)}
              </span>
              <span className="rating-tag">
                <Star size={14} /> {getRatingValue(currentDeliveryPerson.rating)}/5.0
              </span>
            </div>
          </div>
          <div className="profile-secondary">
            <div className="profile-stat">
              <Package size={16} />
              <div>
                <span className="stat-value">{currentDeliveryPerson.total_deliveries || 0}</span>
                <span className="stat-label">Deliveries</span>
              </div>
            </div>
            <div className="profile-stat">
              <DollarSign size={16} />
              <div>
                <span className="stat-value">
                  ${getEarningsValue(currentDeliveryPerson.total_earnings)}
                </span>
                <span className="stat-label">Earnings</span>
              </div>
            </div>
            <div className="profile-stat">
              <Award size={16} />
              <div>
                <span className="stat-value">
                  {getRatingValue(currentDeliveryPerson.rating)}
                </span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} /> Overview
          </button>
          <button 
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} /> Orders ({orders.length})
          </button>
          <button 
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={16} /> Documents
          </button>
          <button 
            className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <TrendingUp size={16} /> Performance
          </button>
        </div>
      </div>

      <div className="content-area">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="info-sections">
              <div className="info-section">
                <h3><User size={18} /> Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Full Name</span>
                    <span className="value">{currentDeliveryPerson.user_name || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">{currentDeliveryPerson.email || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">{currentDeliveryPerson.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">User ID</span>
                    <span className="value">{currentDeliveryPerson.user_id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Delivery Person ID</span>
                    <span className="value">{currentDeliveryPerson.delivery_person_id}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3><Bike size={18} /> Delivery Information</h3>
                <div className="vehicle-card">
                  <div className="vehicle-header">
                    {getVehicleIcon(currentDeliveryPerson.vehicle_type)}
                    <h4>{currentDeliveryPerson.vehicle_type || 'Not specified'}</h4>
                  </div>
                  <div className="vehicle-details">
                    <div className="vehicle-detail">
                      <span className="detail-label">License Number</span>
                      <span className="detail-value">{currentDeliveryPerson.license_number || 'Not provided'}</span>
                    </div>
                    <div className="vehicle-detail">
                      <span className="detail-label">Vehicle Number</span>
                      <span className="detail-value">{currentDeliveryPerson.vehicle_number || 'Not provided'}</span>
                    </div>
                    <div className="vehicle-detail">
                      <span className="detail-label">Status</span>
                      <span className={`detail-value status-${currentDeliveryPerson.status.toLowerCase()}`}>
                        {currentDeliveryPerson.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3><MapPin size={18} /> Activity Summary</h3>
                <div className="activity-summary">
                  <div className="summary-item">
                    <div className="summary-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="summary-content">
                      <h4>Joined Date</h4>
                      <p>{formatDate(currentDeliveryPerson.joined_at)}</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-icon">
                      <Package size={20} />
                    </div>
                    <div className="summary-content">
                      <h4>Total Deliveries</h4>
                      <p>{currentDeliveryPerson.total_deliveries || 0}</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-icon">
                      <DollarSign size={20} />
                    </div>
                    <div className="summary-content">
                      <h4>Total Earnings</h4>
                      <p>${getEarningsValue(currentDeliveryPerson.total_earnings)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-content">
            <div className="orders-header">
              <h3>Recent Delivery Assignments</h3>
              <span className="orders-count">{orders.length} orders found</span>
            </div>
            
            {orders.length === 0 ? (
              <div className="no-orders">
                <Package size={48} />
                <h4>No delivery assignments yet</h4>
                <p>This delivery person hasn't been assigned any orders yet.</p>
              </div>
            ) : (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.order_id}>
                        <td>#{order.order_id}</td>
                        <td>
                          <span className={`order-status ${order.status}`}>
                            {order.status === 'delivered' ? <CheckCircle size={14} /> : 
                             order.status === 'cancelled' ? <XCircle size={14} /> : 
                             <Clock size={14} />}
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{order.items} items</td>
                        <td>${order.amount.toFixed(2)}</td>
                        <td>{formatDate(order.date)}</td>
                        <td>
                          <button className="view-order-btn">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-content">
            <h3>Documents & Verification</h3>
            <div className="documents-grid">
              <div className="document-card">
                <div className="document-icon">
                  <Shield size={24} />
                </div>
                <div className="document-info">
                  <h4>Driver's License</h4>
                  <p>Government issued ID</p>
                  <span className="document-status verified">Verified</span>
                </div>
                <button className="document-action">
                  <Eye size={16} /> View
                </button>
              </div>
              
              <div className="document-card">
                <div className="document-icon">
                  <Car size={24} />
                </div>
                <div className="document-info">
                  <h4>Vehicle Registration</h4>
                  <p>Vehicle ownership proof</p>
                  <span className="document-status pending">Pending</span>
                </div>
                <button className="document-action">
                  <Eye size={16} /> Review
                </button>
              </div>
              
              <div className="document-card">
                <div className="document-icon">
                  <FileText size={24} />
                </div>
                <div className="document-info">
                  <h4>Insurance Certificate</h4>
                  <p>Third-party insurance</p>
                  <span className="document-status verified">Verified</span>
                </div>
                <button className="document-action">
                  <Eye size={16} /> View
                </button>
              </div>
            </div>
            
            <div className="upload-section">
              <h4>Request Additional Documents</h4>
              <p>If additional verification is needed, request documents from the delivery person.</p>
              <button className="btn-request">
                Request Document
              </button>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-content">
            <div className="performance-stats">
              <div className="stat-card-large">
                <div className="stat-header">
                  <TrendingUp size={24} />
                  <h4>Performance Overview</h4>
                </div>
                <div className="stat-body">
                  <div className="stat-row">
                    <span className="stat-label">Completion Rate</span>
                    <span className="stat-value">98%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Avg. Delivery Time</span>
                    <span className="stat-value">32 min</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">On-time Rate</span>
                    <span className="stat-value">95%</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card-large">
                <div className="stat-header">
                  <Star size={24} />
                  <h4>Customer Feedback</h4>
                </div>
                <div className="stat-body">
                  <div className="rating-summary">
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={20} 
                          className={star <= ratingValue ? 'filled' : ''} 
                        />
                      ))}
                    </div>
                    <span className="rating-value">{getRatingValue(currentDeliveryPerson.rating)}/5.0</span>
                  </div>
                  <div className="feedback-comments">
                    <h5>Recent Feedback</h5>
                    <div className="comment">
                      <p>"Very professional and punctual"</p>
                      <span className="comment-date">Jan 14, 2024</span>
                    </div>
                    <div className="comment">
                      <p>"Careful handling of fragile items"</p>
                      <span className="comment-date">Jan 13, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="action-section">
              <h4>Actions</h4>
              <div className="action-buttons">
                <button className="btn-action success">
                  <Award size={16} /> Give Bonus
                </button>
                <button className="btn-action warning">
                  <AlertCircle size={16} /> Send Warning
                </button>
                <button className="btn-action danger">
                  <XCircle size={16} /> Suspend Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPersonDetails;