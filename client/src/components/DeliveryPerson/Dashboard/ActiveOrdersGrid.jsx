import React from 'react';
import './ActiveOrdersGrid.css';
import { 
  MapPin,
  Clock,
  Package,
  Phone,
  Navigation,
  Check,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useDeliveryDashboardContext } from '../../../context/DeliveryPersonDashboardContext';

const ActiveOrdersGrid = () => {
  const { 
    activeDeliveries, 
    loading,
    markAsPicked,
    markAsDelivered,
    initiateCustomerCall,
    fetchNavigationDetails,
    addLog
  } = useDeliveryDashboardContext();

  const handleAction = async (orderId, action) => {
    console.log(`Action: ${action} on order ${orderId}`);
    
    try {
      switch(action) {
        case 'call':
          await initiateCustomerCall(orderId);
          addLog(`Call initiated for order ${orderId}`, 'success');
          break;
        case 'navigate':
          const navResult = await fetchNavigationDetails(orderId);
          if (navResult.success) {
            window.open(navResult.data.google_maps_url, '_blank');
            addLog(`Navigation opened for order ${orderId}`, 'success');
          }
          break;
        case 'mark-picked':
          const pickResult = await markAsPicked(orderId);
          if (pickResult.success) {
            addLog(`Order ${orderId} marked as picked`, 'success');
          }
          break;
        case 'mark-delivered':
          const deliverResult = await markAsDelivered(orderId);
          if (deliverResult.success) {
            addLog(`Order ${orderId} marked as delivered`, 'success');
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      addLog(`Failed to perform ${action} on order ${orderId}: ${error.message}`, 'error');
    }
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'assigned':
      case 'pending': 
        return 'status-pending';
      case 'in_transit':
      case 'transit': 
        return 'status-transit';
      case 'picked_up':
      case 'picked': 
        return 'status-picked';
      default: 
        return '';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'ASSIGNED': return 'Pending Pickup';
      case 'PICKED_UP': return 'Picked Up';
      case 'IN_TRANSIT': return 'In Transit';
      default: return status || 'Unknown';
    }
  };

  const getActionButton = (orderId, action) => {
    switch(action) {
      case 'call':
        return (
          <button 
            className="btn-secondary"
            onClick={() => handleAction(orderId, 'call')}
            disabled={loading}
          >
            <Phone size={16} />
            Call
          </button>
        );
      case 'navigate':
        return (
          <button 
            className="btn-secondary"
            onClick={() => handleAction(orderId, 'navigate')}
            disabled={loading}
          >
            <Navigation size={16} />
            Navigate
          </button>
        );
      case 'mark-picked':
        return (
          <button 
            className="btn-primary"
            onClick={() => handleAction(orderId, 'mark-picked')}
            disabled={loading}
          >
            <Check size={16} />
            Mark Picked
          </button>
        );
      case 'mark-delivered':
        return (
          <button 
            className="btn-success"
            onClick={() => handleAction(orderId, 'mark-delivered')}
            disabled={loading}
          >
            <CheckCircle size={16} />
            Mark Delivered
          </button>
        );
      default:
        return null;
    }
  };

  // Get actions based on status
  const getActionsForStatus = (status) => {
    switch(status) {
      case 'ASSIGNED':
        return ['call', 'navigate', 'mark-picked'];
      case 'PICKED_UP':
        return ['call', 'navigate', 'mark-delivered'];
      case 'IN_TRANSIT':
        return ['call', 'navigate', 'mark-delivered'];
      default:
        return ['call', 'navigate'];
    }
  };

  // Format amount for display
  const formatAmount = (amount) => {
    if (!amount) return null;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading && activeDeliveries.length === 0) {
    return (
      <div className="active-orders-grid">
        <div className="section-header">
          <h3>Active Deliveries</h3>
          <button className="view-all-btn">
            View All
          </button>
        </div>
        <div className="loading-state">
          <p>Loading active deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-orders-grid">
      <div className="section-header">
        <h3>Active Deliveries ({activeDeliveries.length})</h3>
        <button className="view-all-btn">
          View All
        </button>
      </div>

      <div className="orders-list">
        {activeDeliveries.length === 0 ? (
          <div className="no-orders">
            <p>No active deliveries at the moment.</p>
          </div>
        ) : (
          activeDeliveries.map((order) => {
            const actions = getActionsForStatus(order.status);
            
            return (
              <div 
                key={order.id} 
                className={`order-card ${order.priority ? 'urgent' : ''}`}
              >
                <div className="order-header">
                  <div className="order-id">
                    <span className="order-number">#{order.id}</span>
                    {order.priority && (
                      <span className="order-priority">{order.priority}</span>
                    )}
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="order-body">
                  <div className="customer-info">
                    <img 
                      src={order.customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer.name)}&background=10b981&color=fff`} 
                      alt={order.customer.name} 
                      className="customer-avatar"
                    />
                    <div className="customer-details">
                      <strong>{order.customer.name}</strong>
                      <span>{order.customer.phone}</span>
                    </div>
                  </div>

                  <div className="delivery-info">
                    <div className="info-item">
                      <MapPin size={16} />
                      <span>{order.delivery_location} - {order.distance}</span>
                    </div>
                    <div className="info-item">
                      <Clock size={16} />
                      <span>Expected: {order.expected_time}</span>
                    </div>
                    <div className="info-item">
                      <Package size={16} />
                      <span>
                        {order.items} item{order.items > 1 ? 's' : ''}
                        {order.payment_type === 'cod' && order.amount && ` • COD ${formatAmount(order.amount)}`}
                        {order.payment_type === 'prepaid' && ' • Prepaid'}
                      </span>
                    </div>
                  </div>

                  {order.progress > 0 && (
                    <div className="delivery-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {order.progress}% Complete • {order.eta || 'In progress'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  {actions.map((action) => (
                    <React.Fragment key={action}>
                      {getActionButton(order.order_id, action)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActiveOrdersGrid;