import React from 'react';
import './EarningsHistory.css';

const EarningsHistory = ({ transactions, loading }) => {
    if (loading && (!transactions || transactions.length === 0)) {
        return (
            <div className="transactions-section">
                <h3>Transaction History</h3>
                <div className="loading-transactions">
                    <div className="loading-spinner"></div>
                    <p>Loading transaction history...</p>
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="transactions-section">
                <h3>Transaction History</h3>
                <div className="empty-state">
                    <i data-lucide="file-text"></i>
                    <p>No transactions found</p>
                </div>
            </div>
        );
    }

    // Safe access to transaction properties
    const getSafeValue = (obj, key, defaultValue = 'N/A') => {
        if (!obj || typeof obj !== 'object') return defaultValue;
        const value = obj[key];
        return value !== undefined && value !== null ? value : defaultValue;
    };

    return (
        <div className="transactions-section">
            <h3>Transaction History</h3>
            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Orders</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{getSafeValue(transaction, 'date')}</td>
                                <td>{getSafeValue(transaction, 'description')}</td>
                                <td>{getSafeValue(transaction, 'orders_count', 0)} orders</td>
                                <td>₹{getSafeValue(transaction, 'amount', 0)}</td>
                                <td>
                                    <span className={`status-badge ${getSafeValue(transaction, 'status')}`}>
                                        {getSafeValue(transaction, 'status')}
                                    </span>
                                </td>
                                <td>
                                    <button className="icon-btn" title="View Receipt">
                                        <i data-lucide="receipt"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EarningsHistory;