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
  Tag,
  Truck,
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
  ShoppingBag,
  HelpCircle,
  Map,
  Package as InventoryIcon
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
  const [usersMenuOpen, setUsersMenuOpen] = useState(
    location.pathname.startsWith('/admin/users')
  );
  
  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [darkMode]);

  // Update usersMenuOpen when location changes
  useEffect(() => {
    setUsersMenuOpen(location.pathname.startsWith('/admin/users'));
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Simplified menu structure with only essential items
  const menuStructure = [
    {
      section: 'Dashboard',
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
      ]
    },
    {
      section: 'Core Operations',
      items: [
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { 
          type: 'submenu',
          label: 'Users',
          icon: Users,
          items: [
            { path: '/admin/users/customers', icon: User, label: 'Customers' },
            { path: '/admin/users/delivery-persons', icon: Truck, label: 'Delivery Agents' }
          ]
        },
        { path: '/admin/inventory', icon: InventoryIcon, label: 'Inventory' }
      ]
    },
    {
      section: 'Business & Analytics',
      items: [
        { path: '/admin/marketing', icon: Tag, label: 'Marketing' },
        { path: '/admin/delivery', icon: Map, label: 'Delivery' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin/reports', icon: FileText, label: 'Reports' }
      ]
    },
    {
      section: 'Settings',
      items: [
        { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
        { path: '/admin/system', icon: Settings, label: 'Settings' }
      ]
    }
  ];

  // User menu items
  const userMenuItems = [
    { icon: User, label: 'My Profile', onClick: () => navigate('/admin/profile') },
    { icon: Settings, label: 'Account Settings', onClick: () => navigate('/admin/system/account') },
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
  const getCurrentPageTitle = () => {
    for (const section of menuStructure) {
      for (const item of section.items) {
        if (item.type === 'submenu') {
          const subItem = item.items.find(sub => 
            location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
          );
          if (subItem) return subItem.label;
        } else if (location.pathname === item.path || location.pathname.startsWith(item.path + '/')) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  };

  const currentPageTitle = getCurrentPageTitle();

  return (
    <div className={`admin-layout ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="navbar-left">
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="page-info">
            <h1 className="page-title">{currentPageTitle}</h1>
            <div className="breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-item">
                <Home size={14} />
                <span>Home</span>
              </Link>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span className="breadcrumb-item current">{currentPageTitle}</span>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search orders, products, customers..."
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
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="notification-container">
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="user-profile-container">
            <button 
              className="user-profile-btn"
              onClick={() => setUserProfileOpen(!userProfileOpen)}
              aria-label="User profile"
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
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Main Navigation - Only Menu Items */}
        <nav className="sidebar-nav">
          {menuStructure.map((section, sectionIndex) => (
            <div className="nav-section" key={sectionIndex}>
              {sidebarOpen && section.section !== 'Dashboard' && (
                <h3 className="nav-section-title">{section.section}</h3>
              )}
              
              {section.items.map((item, itemIndex) => {
                if (item.type === 'submenu') {
                  const Icon = item.icon;
                  const isActive = item.items.some(subItem => 
                    location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')
                  );
                  
                  return (
                    <React.Fragment key={`${sectionIndex}-${itemIndex}`}>
                      <div
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setUsersMenuOpen(!usersMenuOpen)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="nav-item-icon">
                          <Icon size={20} />
                        </div>
                        
                        {sidebarOpen && (
                          <>
                            <span className="nav-item-label">{item.label}</span>
                            <ChevronRight
                              size={16}
                              className={`submenu-arrow ${usersMenuOpen ? 'open' : ''}`}
                            />
                          </>
                        )}
                        {isActive && !usersMenuOpen && <div className="nav-item-indicator"></div>}
                      </div>

                      {/* Submenu */}
                      {usersMenuOpen && sidebarOpen && (
                        <div className="nav-submenu">
                          {item.items.map(subItem => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname === subItem.path || 
                                              location.pathname.startsWith(subItem.path + '/');
                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`nav-item sub-item ${isSubActive ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div className="nav-item-icon">
                                  <SubIcon size={18} />
                                </div>
                                <span className="nav-item-label">{subItem.label}</span>
                                {isSubActive && <div className="nav-item-indicator"></div>}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                }

                // Regular menu item
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                               location.pathname.startsWith(item.path + '/');
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
                    
                    {sidebarOpen && (
                      <span className="nav-item-label">{item.label}</span>
                    )}
                    
                    {isActive && <div className="nav-item-indicator"></div>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer - Only Help Center & Logout */}
        <div className="sidebar-footer">
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