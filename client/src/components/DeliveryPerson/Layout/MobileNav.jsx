import React from 'react';
import './MobileNav.css';
import { 
  LayoutDashboard,
  Package,
  Map,
  Wallet,
  User
} from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Home' },
    { id: 'deliveries', icon: <Package size={24} />, label: 'Deliveries' },
    { id: 'map', icon: <Map size={24} />, label: 'Map' },
    { id: 'earnings', icon: <Wallet size={24} />, label: 'Earnings' },
    { id: 'profile', icon: <User size={24} />, label: 'Profile' },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className="mobile-nav-item"
          onClick={() => console.log(`Navigate to ${item.id}`)}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;