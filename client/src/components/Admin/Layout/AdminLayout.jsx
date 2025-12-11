import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  LogOut,
  Menu,
  X,
  Layers,
  Award,
  Tag,
  Truck,
  CreditCard,
  BarChart3,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Moon,
  Sun,
  Home,
  Grid,
  ShoppingBag,
  FolderTree,
  MessageSquare,
  Shield,
  HelpCircle
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  
  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/categories', icon: Layers, label: 'Categories' },
    { path: '/admin/brands', icon: Award, label: 'Brands' },
    { path: '/admin/marketing', icon: Tag, label: 'Marketing' },
    { path: '/admin/delivery', icon: Truck, label: 'Delivery' },
    { path: '/admin/finance', icon: CreditCard, label: 'Finance' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Additional menu items grouped by section
  const additionalMenuItems = [
    {
      section: 'Content',
      items: [
        { path: '/admin/pages', icon: FileText, label: 'Pages' },
        { path: '/admin/blog', icon: MessageSquare, label: 'Blog' },
        { path: '/admin/media', icon: FolderTree, label: 'Media Library' },
      ]
    },
    {
      section: 'System',
      items: [
        { path: '/admin/users', icon: Users, label: 'Users & Roles' },
        { path: '/admin/security', icon: Shield, label: 'Security' },
        { path: '/admin/logs', icon: FileText, label: 'System Logs' },
      ]
    }
  ];

  // User menu items
  const userMenuItems = [
    { icon: User, label: 'My Profile', onClick: () => navigate('/admin/profile') },
    { icon: Settings, label: 'Account Settings', onClick: () => navigate('/admin/settings/account') },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => window.open('/help', '_blank') },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
      // navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Get current page title from menu items
  const currentPage = menuItems.find(item => location.pathname === item.path) || 
                     menuItems.find(item => location.pathname.startsWith(item.path)) || 
                     { label: 'Dashboard' };

  return (
    <div className={`admin-layout ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="navbar-left">
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="page-info">
            <h1 className="page-title">{currentPage.label}</h1>
            <div className="breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-item">
                <Home size={14} />
                <span>Home</span>
              </Link>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span className="breadcrumb-item current">{currentPage.label}</span>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {/* Dark Mode Toggle */}
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="notification-container">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="user-profile-container">
            <button 
              className="user-profile-btn"
              onClick={() => setUserProfileOpen(!userProfileOpen)}
            >
              <div className="user-avatar">
                <User size={20} />
              </div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
              <ChevronRight size={16} className={`dropdown-arrow ${userProfileOpen ? 'open' : ''}`} />
            </button>

            {userProfileOpen && (
              <div className="user-profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">
                      <User size={24} />
                    </div>
                    <div>
                      <h4>Admin User</h4>
                      <p>admin@example.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                {userMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={index}
                      className="dropdown-item"
                      onClick={() => {
                        item.onClick();
                        setUserProfileOpen(false);
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                
                <div className="dropdown-divider"></div>
                
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <ShoppingBag size={28} />
            </div>
            {sidebarOpen && (
              <div className="logo-text">
                <h2>E-Commerce</h2>
                <span className="logo-subtitle">Admin Panel</span>
              </div>
            )}
          </div>
          
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Search in Sidebar (Mobile) */}
        <div className="sidebar-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="sidebar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Main</h3>
            {menuItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="nav-item-icon">
                    <Icon size={20} />
                  </div>
                  {sidebarOpen && <span className="nav-item-label">{item.label}</span>}
                  {isActive && <div className="nav-item-indicator"></div>}
                </Link>
              );
            })}
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Catalog</h3>
            {menuItems.slice(4, 6).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="nav-item-icon">
                    <Icon size={20} />
                  </div>
                  {sidebarOpen && <span className="nav-item-label">{item.label}</span>}
                  {isActive && <div className="nav-item-indicator"></div>}
                </Link>
              );
            })}
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Business</h3>
            {menuItems.slice(6, 10).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="nav-item-icon">
                    <Icon size={20} />
                  </div>
                  {sidebarOpen && <span className="nav-item-label">{item.label}</span>}
                  {isActive && <div className="nav-item-indicator"></div>}
                </Link>
              );
            })}
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Insights</h3>
            {menuItems.slice(10, 12).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="nav-item-icon">
                    <Icon size={20} />
                  </div>
                  {sidebarOpen && <span className="nav-item-label">{item.label}</span>}
                  {isActive && <div className="nav-item-indicator"></div>}
                </Link>
              );
            })}
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">System</h3>
            {menuItems.slice(12).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="nav-item-icon">
                    <Icon size={20} />
                  </div>
                  {sidebarOpen && <span className="nav-item-label">{item.label}</span>}
                  {isActive && <div className="nav-item-indicator"></div>}
                </Link>
              );
            })}
          </div>

          {/* Additional Sections */}
          {sidebarOpen && additionalMenuItems.map((section, sectionIndex) => (
            <div className="nav-section" key={sectionIndex}>
              <h3 className="nav-section-title">{section.section}</h3>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="nav-item-icon">
                      <Icon size={20} />
                    </div>
                    <span className="nav-item-label">{item.label}</span>
                    {isActive && <div className="nav-item-indicator"></div>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-label">Online Users</span>
                <span className="stat-value">42</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Pending Orders</span>
                <span className="stat-value">12</span>
              </div>
            </div>
          )}
          
          <div className="sidebar-actions">
            <button 
              className="help-btn"
              onClick={() => window.open('/help', '_blank')}
              title="Help & Support"
            >
              <HelpCircle size={20} />
              {sidebarOpen && <span>Help Center</span>}
            </button>
            
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;