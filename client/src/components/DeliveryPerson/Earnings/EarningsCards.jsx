import React from 'react';
import './EarningsCards.css';

const EarningsCards = ({ 
    todayEarnings, 
    weeklyEarnings, 
    monthlyEarnings, 
    earningsOverview,
    loading 
}) => {
    return (
        <div className="earnings-cards-grid">
            <div className="earnings-card">
                <span className="earnings-label">Today</span>
                <span className="earnings-value">
                    ₹{loading ? '...' : (todayEarnings?.total_earnings || 0)}
                </span>
                <span className="earnings-count">
                    {loading ? '...' : (todayEarnings?.delivery_count || 0)} deliveries
                </span>
            </div>
            <div className="earnings-card">
                <span className="earnings-label">This Week</span>
                <span className="earnings-value">
                    ₹{loading ? '...' : (weeklyEarnings?.total_earnings || 0)}
                </span>
                <span className="earnings-count">
                    {loading ? '...' : (weeklyEarnings?.delivery_count || 0)} deliveries
                </span>
            </div>
            <div className="earnings-card">
                <span className="earnings-label">This Month</span>
                <span className="earnings-value">
                    ₹{loading ? '...' : (monthlyEarnings?.total_earnings || 0)}
                </span>
                <span className="earnings-count">
                    {loading ? '...' : (monthlyEarnings?.delivery_count || 0)} deliveries
                </span>
            </div>
            <div className="earnings-card">
                <span className="earnings-label">Pending</span>
                <span className="earnings-value">
                    ₹{loading ? '...' : (earningsOverview?.pending_amount || 0)}
                </span>
                <span className="earnings-count">To be settled</span>
            </div>
        </div>
    );
};

export default EarningsCards;