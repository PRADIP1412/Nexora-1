import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { 
  User, Mail, Phone, Calendar, DollarSign, Package, 
  ChevronLeft, Edit, ShoppingBag, Clock, CheckCircle, XCircle,
  Activity, CreditCard, MapPin, History
} from 'lucide-react';
import './CustomerDetails.css';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { 
    currentCustomer, 
    loading, 
    error, 
    fetchCustomerById, 
    fetchCustomerOrders, 
    fetchCustomerStats 
  } = useCustomerContext();
  
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (customerId) {
      fetchCustomerById(customerId);
      loadCustomerData();
    }
  }, [customerId]);

  // Helper function to get customer name
  const getCustomerName = (customer) => {
    if (!customer) return 'Unknown Customer';
    
    // First try to use full_name if it exists
    if (customer.full_name && customer.full_name !== 'Unknown Customer') {
      return customer.full_name;
    }
    
    // Otherwise combine first_name and last_name
    if (customer.first_name || customer.last_name) {
      return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    }
    
    // Fallback to email or unknown
    return customer.email ? `Customer (${customer.email})` : 'Unknown Customer';
  };

  // Helper function to get initials for avatar
  const getCustomerInitials = (customer) => {
    const name = getCustomerName(customer);
    if (name && name !== 'Unknown Customer') {
      // Get first letter of each word
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    }
    return customer?.email ? customer.email.charAt(0).toUpperCase() : 'C';
  };

  const loadCustomerData = async () => {
    // Load orders if needed
    const ordersResult = await fetchCustomerOrders(customerId);
    if (ordersResult.success) setOrders(ordersResult.data || []);
    
    // Load stats if needed
    const statsResult = await fetchCustomerStats(customerId);
    if (statsResult.success) setStats(statsResult.data);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/admin/users/customers')} className="back-btn">
          <ChevronLeft size={16} /> Back to Customers
        </button>
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="not-found">
        <h3>Customer not found</h3>
        <button onClick={() => navigate('/admin/users/customers')} className="back-btn">
          <ChevronLeft size={16} /> Back to Customers
        </button>
      </div>
    );
  }

  const customerName = getCustomerName(currentCustomer);
  const customerInitials = getCustomerInitials(currentCustomer);

  return (
    <div className="customer-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/admin/users/customers')}>
          <ChevronLeft size={20} /> Back to Customers
        </button>
        
        <div className="header-actions">
          <button className="btn-edit" onClick={() => navigate(`/admin/users/customers/edit/${customerId}`)}>
            <Edit size={16} /> Edit Customer
          </button>
        </div>
      </div>

      <div className="customer-profile-header">
        <div className="profile-avatar">
          {customerInitials}
        </div>
        <div className="profile-info">
          <h1>{customerName}</h1>
          <p className="customer-id">Customer ID: #{currentCustomer.user_id}</p>
          <div className="profile-tags">
            <span className={`status-badge ${currentCustomer.is_active ? 'active' : 'inactive'}`}>
              {currentCustomer.is_active ? 'Active' : 'Inactive'}
            </span>
            {currentCustomer.created_at && (
              <span className="member-since">
                <Calendar size={14} /> Member since {new Date(currentCustomer.created_at).toLocaleDateString()}
              </span>
            )}
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
            <ShoppingBag size={16} /> Orders ({orders.length})
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <History size={16} /> Activity
          </button>
        </div>
      </div>

      <div className="content-area">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="info-sections">
              <div className="info-section">
                <h3><User size={18} /> Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Full Name</span>
                    <span className="value">{customerName}</span>
                  </div>
                  {currentCustomer.first_name && (
                    <div className="info-item">
                      <span className="label">First Name</span>
                      <span className="value">{currentCustomer.first_name}</span>
                    </div>
                  )}
                  {currentCustomer.last_name && (
                    <div className="info-item">
                      <span className="label">Last Name</span>
                      <span className="value">{currentCustomer.last_name}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">{currentCustomer.email || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">{currentCustomer.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Customer ID</span>
                    <span className="value">#{currentCustomer.user_id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Account Status</span>
                    <span className={`value status-indicator ${currentCustomer.is_active ? 'active' : 'inactive'}`}>
                      {currentCustomer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {stats && (
                <div className="info-section">
                  <h3><DollarSign size={18} /> Statistics</h3>
                  <div className="stats-card">
                    <div className="stat-item">
                      <Package size={20} />
                      <div>
                        <span className="stat-value">{stats.total_orders || 0}</span>
                        <span className="stat-label">Total Orders</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <DollarSign size={20} />
                      <div>
                        <span className="stat-value">${(stats.total_spent || 0).toFixed(2)}</span>
                        <span className="stat-label">Total Spent</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="info-section">
                <h3><History size={18} /> Recent Activity</h3>
                <div className="recent-activity">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <ShoppingBag size={16} />
                    </div>
                    <div className="activity-content">
                      <p>Last order placed</p>
                      <span className="activity-time">
                        {orders.length > 0 ? 
                          new Date(orders[0]?.created_at || new Date()).toLocaleDateString() : 
                          'No orders yet'}
                      </span>
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
              <h3>Order History</h3>
              <span className="orders-count">{orders.length} orders found</span>
            </div>
            
            {orders.length === 0 ? (
              <div className="no-orders">
                <Package size={48} />
                <h4>No orders yet</h4>
                <p>This customer hasn't placed any orders yet.</p>
              </div>
            ) : (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.order_id}>
                        <td>#{order.order_id}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`order-status ${order.status}`}>
                            {order.status === 'delivered' ? <CheckCircle size={14} /> : 
                             order.status === 'cancelled' ? <XCircle size={14} /> : 
                             <Clock size={14} />}
                            {order.status}
                          </span>
                        </td>
                        <td>${order.total_amount?.toFixed(2) || '0.00'}</td>
                        <td>
                          <button 
                            className="view-order-btn"
                            onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                          >
                            View
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

        {activeTab === 'activity' && (
          <div className="activity-content">
            <h3>Customer Activity Log</h3>
            <div className="activity-log">
              {orders.length > 0 ? (
                orders.slice(0, 10).map((order, index) => (
                  <div key={index} className="log-entry">
                    <div className="log-icon">
                      <ShoppingBag size={16} />
                    </div>
                    <div className="log-details">
                      <p>Placed order #{order.order_id} for ${order.total_amount?.toFixed(2)}</p>
                      <span className="log-time">{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <p>No recent activity recorded</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;