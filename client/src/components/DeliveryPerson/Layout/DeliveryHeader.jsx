import React, { useState, useEffect } from 'react';
import { useDeliveryPersonContext } from '../../../context/DeliveryPersonContext';
import { useNotification } from '../../../context/NotificationContext';
import './DeliveryHeader.css';
import { 
  Menu, 
  Bell, 
  ChevronDown,
  User,
  Clock,
  Circle,
  CircleDot
} from 'lucide-react';

const DeliveryHeader = ({ toggleSidebar, sidebarOpen }) => {
  const { 
    currentDeliveryPerson, 
    fetchMyDeliveryProfile, 
    updateDeliveryPersonStatus 
  } = useDeliveryPersonContext();
  
  const {
    notifications,
    unreadCount,
    isLoading,
    showDropdown,
    fetchNotifications,
    markAllAsRead,
    toggleDropdown,
    closeDropdown
  } = useNotification();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchMyDeliveryProfile();
        await fetchNotifications();
      } catch (error) {
        console.error('Error loading header data:', error);
      }
    };
    
    loadData();
  }, [fetchMyDeliveryProfile, fetchNotifications]);

  // Update online status based on delivery person status
  useEffect(() => {
    if (currentDeliveryPerson?.status) {
      const status = currentDeliveryPerson.status.toLowerCase();
      setIsOnline(status === 'online' || status === 'available');
    }
  }, [currentDeliveryPerson]);

  const toggleStatus = async () => {
    try {
      const newStatus = isOnline ? 'offline' : 'online';
      await updateDeliveryPersonStatus(currentDeliveryPerson.delivery_person_id, newStatus);
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getStatusIcon = () => {
    return isOnline ? (
      <CircleDot size={10} className="status-icon online" />
    ) : (
      <Circle size={10} className="status-icon offline" />
    );
  };

  const getAvatarUrl = () => {
    if (currentDeliveryPerson?.profile_picture) {
      return currentDeliveryPerson.profile_picture;
    }
    const name = currentDeliveryPerson?.name || 'Delivery Partner';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=80`;
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('delivery_status');
    localStorage.removeItem('delivery_notifications');
    
    // Navigate to login page
    window.location.href = '/login';
  };

  return (
    <header className="delivery-header">
      <div className="header-left">
        <button 
          className="menu-toggle" 
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={24} />
        </button>
        
        <div className="logo">
          <h1>Nexora <span>Delivery</span></h1>
        </div>
      </div>

      <div className="header-center">
        <div className="status-toggle">
          <span className="status-label">Status:</span>
          <button 
            className={`status-btn ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleStatus}
            disabled={!currentDeliveryPerson}
          >
            {getStatusIcon()}
            {isOnline ? 'Available' : 'Busy'}
          </button>
        </div>
      </div>

      <div className="header-right">
        <div className="time-display">
          <Clock size={16} />
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="notification-wrapper">
          <button 
            className="notification-btn"
            onClick={() => {
              toggleDropdown();
              setShowNotifications(!showNotifications);
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showDropdown && (
            <div className="notification-panel">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button 
                  className="close-btn"
                  onClick={() => {
                    closeDropdown();
                    setShowNotifications(false);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="notification-list">
                {isLoading ? (
                  <div className="notification-loading">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map(notification => (
                    <div 
                      key={notification.notification_id} 
                      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    >
                      <div className="notification-icon">
                        {notification.type === 'delivery' && '📦'}
                        {notification.type === 'payment' && '💰'}
                        {notification.type === 'rating' && '⭐'}
                        {notification.type === 'system' && '🔔'}
                      </div>
                      <div className="notification-content">
                        <strong>{notification.message}</strong>
                        <span className="notification-time">
                          {new Date(notification.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="notification-footer">
                <button 
                  className="btn-text"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
                <button className="btn-text" onClick={() => window.location.href = '/delivery/notifications'}>
                  View all
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="user-wrapper">
          <button 
            className="user-menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img 
              src={getAvatarUrl()} 
              alt={currentDeliveryPerson?.name || 'User'} 
              className="user-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=80';
              }}
            />
            <div className="user-info">
              <span className="user-name">{currentDeliveryPerson?.name || 'Loading...'}</span>
              <span className="user-role">Delivery Partner</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <button 
                className="dropdown-item"
                onClick={() => window.location.href = '/delivery/profile'}
              >
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button 
                className="dropdown-item"
                onClick={() => window.location.href = '/notifications'}
              >
                <Bell size={16} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="dropdown-badge">{unreadCount}</span>
                )}
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {showDropdown && (
        <div 
          className="dropdown-backdrop"
          onClick={() => {
            closeDropdown();
            setShowNotifications(false);
          }}
        />
      )}
      {showUserMenu && (
        <div 
          className="dropdown-backdrop"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default DeliveryHeader;