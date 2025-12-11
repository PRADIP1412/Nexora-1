import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import './AdminHeader.css';
import { useAuth } from '../../../context/AuthContext';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const { logout } = useAuth();

  // If you have endpoint to get notifications count, call here. For now 0 or computed by alerts length.
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const mockNotifications = [
    { id: 1, message: 'New order #12345 placed', time: '5 min ago', read: false },
    { id: 2, message: 'Product "iPhone 15" is low in stock', time: '1 hour ago', read: false },
  ];

  return (
    <header className="admin-header">
      <div className="header-left">
        <form onSubmit={handleSearch} className="admin-search">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>
      </div>

      <div className="header-right">
        <div className="notifications-container">
          <button
            className="header-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={22} />
            {notificationsCount > 0 && <span className="notification-badge">{notificationsCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications</h4>
              </div>
              <div className="notifications-list">
                {mockNotifications.map(n => (
                  <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{n.time}</span>
                  </div>
                ))}
              </div>
              <button className="view-all-notifications">View all notifications</button>
            </div>
          )}
        </div>

        <button className="header-btn settings-btn" onClick={() => navigate('/admin/settings')}><Settings size={22} /></button>

        <div className="admin-profile" onClick={() => navigate('/admin/profile')}>
          <User size={24} />
          <span className="admin-name">Admin</span>
        </div>

        <button onClick={handleLogout} className="logout-btn" title="Logout"><LogOut size={20} /></button>
      </div>
    </header>
  );
};

export default AdminHeader;
