import React, { useEffect } from 'react';
import './EarningsOverview.css';
import { useDeliveryDashboardContext } from '../../../context/DeliveryPersonDashboardContext';

const EarningsOverview = () => {
  const { earningsOverview, loading, fetchEarningsOverview, addLog } = useDeliveryDashboardContext();

  useEffect(() => {
    if (!earningsOverview) {
      fetchEarningsOverview();
    }
  }, [earningsOverview, fetchEarningsOverview]);

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  // Transform API data to component format
  const earningsData = earningsOverview?.periods ? [
    {
      period: 'Today',
      amount: earningsOverview.periods[0]?.amount || 0,
      deliveries: earningsOverview.periods[0]?.deliveries || 0,
      color: '#3b82f6'
    },
    {
      period: 'This Week',
      amount: earningsOverview.periods[1]?.amount || 0,
      deliveries: earningsOverview.periods[1]?.deliveries || 0,
      color: '#10b981'
    },
    {
      period: 'This Month',
      amount: earningsOverview.periods[2]?.amount || 0,
      deliveries: earningsOverview.periods[2]?.deliveries || 0,
      color: '#8b5cf6'
    },
    {
      period: 'Pending',
      amount: earningsOverview.pending_settlement || 0,
      description: 'To be settled',
      color: '#f59e0b'
    }
  ] : [];

  if (loading && !earningsOverview) {
    return (
      <div className="earnings-overview">
        <h3>Earnings Overview</h3>
        <div className="earnings-grid loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="earnings-card loading-card">
              <div className="earnings-header">
                <div className="earnings-period loading-line"></div>
                <div className="color-indicator" style={{ backgroundColor: '#ccc' }}></div>
              </div>
              <div className="earnings-amount loading-line large"></div>
              <div className="earnings-details">
                <div className="loading-line small"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!earningsOverview) {
    return (
      <div className="earnings-overview">
        <h3>Earnings Overview</h3>
        <div className="no-data">
          <p>Unable to load earnings data.</p>
          <button onClick={fetchEarningsOverview} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings-overview">
      <h3>Earnings Overview</h3>
      <div className="earnings-grid">
        {earningsData.map((item) => (
          <div 
            key={item.period} 
            className="earnings-card"
            style={{ '--card-color': item.color }}
          >
            <div className="earnings-header">
              <span className="earnings-period">{item.period}</span>
              <div 
                className="color-indicator"
                style={{ backgroundColor: item.color }}
              ></div>
            </div>
            
            <div className="earnings-amount">
              {formatCurrency(item.amount)}
            </div>
            
            <div className="earnings-details">
              {item.deliveries ? (
                <span className="deliveries-count">
                  {item.deliveries} deliver{item.deliveries === 1 ? 'y' : 'ies'}
                </span>
              ) : (
                <span className="pending-description">{item.description}</span>
              )}
            </div>
            
            {item.period === 'Today' && earningsData[1]?.amount > 0 && (
              <div className="earnings-trend">
                <span className="trend-up">
                  ↑ {((earningsData[0].amount / earningsData[1].amount) * 100).toFixed(0)}% from weekly average
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsOverview;