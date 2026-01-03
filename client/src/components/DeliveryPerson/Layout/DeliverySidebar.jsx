import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DeliverySidebar.css';
import { 
  LayoutDashboard,
  Bell,
  Package,
  Clock,
  CheckCircle,
  Wallet,
  Map,
  TrendingUp,
  Calendar,
  Bike,
  Headphones,
  User,
  LogOut,
  Home,
  FileText,
  PackageSearch,
  RefreshCw
} from 'lucide-react';
import { useAvailableDeliveriesContext } from '../../../context/delivery_panel/AvailableDeliveriesContext';
import { useNotification } from '../../../context/NotificationContext'; // Add this import

const DeliverySidebar = ({ isOpen, isMobile, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use Available Deliveries Context
  const { 
    availableDeliveries, 
    loading,
    getDeliveryStats 
  } = useAvailableDeliveriesContext();

  // Use Notification Context
  const { unreadCount } = useNotification(); // Add this line

  // Get stats from context
  const deliveryStats = getDeliveryStats();
  
  // Calculate real-time data
  const calculateRealTimeData = () => {
    return {
      availableDeliveries: deliveryStats.totalAvailable || 0,
      activeDeliveries: 0, // This should come from ActiveDeliveriesContext
      pendingPickup: 0,    // This should come from PendingPickupsContext
      completed: 0,        // This should come from CompletedDeliveriesContext
      earnings: 0,         // This should come from EarningsContext
      scheduleShifts: 0    // This should come from ScheduleContext
    };
  };

  const realTimeData = calculateRealTimeData();

  // Navigation data with routes
  const [navItems, setNavItems] = useState([
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/delivery/dashboard',
      badge: null 
    },
    { 
      id: 'available-deliveries', 
      label: 'Available Deliveries', 
      icon: <PackageSearch size={20} />, 
      path: '/delivery/available-deliveries',
      badge: loading ? <RefreshCw className="spinner" size={14} /> : realTimeData.availableDeliveries,
      isBadgeLoading: loading
    },
    { 
      id: 'active-deliveries', 
      label: 'Active Deliveries', 
      icon: <Package size={20} />, 
      path: '/delivery/active-deliveries',
      badge: realTimeData.activeDeliveries || null
    },
    { 
      id: 'pending-pickup', 
      label: 'Pending Pickup', 
      icon: <Clock size={20} />, 
      path: '/delivery/pending-pickup',
      badge: realTimeData.pendingPickup || null
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: <CheckCircle size={20} />, 
      path: '/delivery/completed',
      badge: null 
    },
    { 
      id: 'earnings', 
      label: 'Earnings', 
      icon: <Wallet size={20} />, 
      path: '/delivery/earnings',
      badge: null 
    },
    { 
      id: 'route-map', 
      label: 'Route Map', 
      icon: <Map size={20} />, 
      path: '/delivery/route-map',
      badge: null 
    },
    { 
      id: 'performance', 
      label: 'Performance', 
      icon: <TrendingUp size={20} />, 
      path: '/delivery/performance',
      badge: null 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: <FileText size={20} />, 
      path: '/delivery/reports',
      badge: null 
    },
    { 
      id: 'schedule', 
      label: 'My Schedule', 
      icon: <Calendar size={20} />, 
      path: '/delivery/schedule',
      badge: realTimeData.scheduleShifts || null
    },
    { 
      id: 'vehicle', 
      label: 'Vehicle Info', 
      icon: <Bike size={20} />, 
      path: '/delivery/vehicle',
      badge: null 
    },
    { 
      id: 'support', 
      label: 'Support', 
      icon: <Headphones size={20} />, 
      path: '/delivery/support',
      badge: null 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <User size={20} />, 
      path: '/delivery/profile',
      badge: null 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: <Bell size={20} />, 
      path: '/delivery/notifications',
      badge: unreadCount > 0 ? unreadCount : null // Fixed: using the actual unreadCount from context
    },
  ]);

  // Determine which item is active based on current URL
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Update active state for all items
    const updatedItems = navItems.map(item => ({
      ...item,
      active: currentPath === item.path || 
              currentPath.startsWith(item.path + '/') ||
              (item.path === '/delivery/dashboard' && currentPath === '/delivery')
    }));
    
    setNavItems(updatedItems);
  }, [location.pathname]);

  // Update badge counts when available deliveries or unreadCount changes
  useEffect(() => {
    setNavItems(prevItems => 
      prevItems.map(item => {
        if (item.id === 'available-deliveries') {
          return {
            ...item,
            badge: loading ? <RefreshCw className="spinner" size={14} /> : realTimeData.availableDeliveries,
            isBadgeLoading: loading
          };
        }
        if (item.id === 'notifications') {
          return {
            ...item,
            badge: unreadCount > 0 ? unreadCount : null
          };
        }
        return item;
      })
    );
  }, [realTimeData.availableDeliveries, loading, unreadCount]);

  const handleNavigation = (item) => {
    navigate(item.path);
    
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('delivery_status');
    localStorage.removeItem('delivery_notifications');
    
    // Navigate to login page
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <aside className={`delivery-sidebar ${isOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
      <nav className="sidebar-nav">
        {/* Home Button */}
        <div className="nav-header">
          <button className="home-btn" onClick={handleGoToHome}>
            <Home size={20} />
            {isOpen && <span>Back to Home</span>}
          </button>
        </div>
        
        {/* Delivery Dashboard Header */}
        {isOpen && (
          <div className="delivery-header">
            <h3>Delivery Dashboard</h3>
            <div className="delivery-status">
              <div className="status-indicator active"></div>
              <span>Online</span>
            </div>
          </div>
        )}
        
        {/* Main Navigation */}
        <div className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={() => handleNavigation(item)}
              title={!isOpen ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {isOpen && <span className="nav-label">{item.label}</span>}
              {item.badge !== null && (
                <span className={`nav-badge ${item.isBadgeLoading ? 'loading' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats Summary (Collapsed View) */}
        {!isOpen && !isMobile && (
          <div className="sidebar-stats-collapsed">
            <div className="stat-item" title="Available Deliveries">
              <PackageSearch size={16} />
              <span>{realTimeData.availableDeliveries}</span>
            </div>
            <div className="stat-item" title="Active Deliveries">
              <Package size={16} />
              <span>{realTimeData.activeDeliveries}</span>
            </div>
            <div className="stat-item" title="Earnings">
              <Wallet size={16} />
              <span>₹{realTimeData.earnings}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
          
          {/* User Info */}
          {isOpen && (
            <div className="user-info">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <div className="user-details">
                <span className="user-name">Delivery Partner</span>
                <span className="user-role">Online</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

// Add CSS for spinner animation
const styles = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nav-badge.loading svg {
  animation: spin 1s linear infinite;
}

.sidebar-stats-collapsed .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  color: #6b7280;
  cursor: default;
}

.sidebar-stats-collapsed .stat-item:hover {
  background-color: transparent;
}

.sidebar-stats-collapsed .stat-item span {
  font-size: 12px;
  font-weight: 600;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default DeliverySidebar;