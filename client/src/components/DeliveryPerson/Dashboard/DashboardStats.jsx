import React, { useEffect } from 'react';
import './DashboardStats.css';
import { 
  Package,
  CheckCircle,
  DollarSign,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useDeliveryDashboardContext } from '../../../context/DeliveryPersonDashboardContext';

const DashboardStats = () => {
  const { dashboardStats, loading, fetchDashboardStats, addLog } = useDeliveryDashboardContext();

  useEffect(() => {
    if (!dashboardStats) {
      fetchDashboardStats();
    }
  }, [dashboardStats, fetchDashboardStats]);

  // Format stats data from context
  const statsData = dashboardStats ? [
    {
      id: 'today-deliveries',
      label: "Today's Deliveries",
      value: dashboardStats.today_deliveries?.toString() || "0",
      change: dashboardStats.yesterday_comparison > 0 
        ? `+${dashboardStats.yesterday_comparison.toFixed(1)}% from yesterday`
        : `${dashboardStats.yesterday_comparison.toFixed(1)}% from yesterday`,
      changeType: dashboardStats.yesterday_comparison > 0 ? 'positive' : 'neutral',
      icon: <Package size={24} />,
      color: 'primary'
    },
    {
      id: 'completed',
      label: "Completed",
      value: dashboardStats.completed?.toString() || "0",
      change: `${dashboardStats.in_progress || 0} in progress`,
      changeType: 'neutral',
      icon: <CheckCircle size={24} />,
      color: 'success'
    },
    {
      id: 'earnings',
      label: "Today's Earnings",
      value: `₹${dashboardStats.earnings?.toFixed(0) || "0"}`,
      change: `Avg: ₹${dashboardStats.average_per_delivery?.toFixed(0) || "0"}/delivery`,
      changeType: 'neutral',
      icon: <DollarSign size={24} />,
      color: 'warning'
    },
    {
      id: 'rating',
      label: "Rating",
      value: dashboardStats.rating?.toFixed(1) || "0.0",
      change: `Based on ${dashboardStats.total_reviews || 0} reviews`,
      changeType: 'neutral',
      icon: <Star size={24} />,
      color: 'info'
    }
  ] : [];

  if (loading && !dashboardStats) {
    return (
      <div className="dashboard-stats">
        <div className="stats-grid loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card loading-card">
              <div className="stat-icon loading-icon"></div>
              <div className="stat-content">
                <div className="stat-label loading-line"></div>
                <div className="stat-value loading-line large"></div>
                <div className="stat-change loading-line small"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="dashboard-stats">
        <div className="no-data">
          <p>No dashboard data available. Please check your connection.</p>
          <button onClick={fetchDashboardStats} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      <div className="stats-grid">
        {statsData.map((stat) => (
          <div 
            key={stat.id} 
            className={`stat-card ${stat.color}`}
          >
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.changeType}`}>
                {stat.changeType === 'positive' && <TrendingUp size={12} />}
                {stat.changeType === 'neutral' && <Clock size={12} />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;