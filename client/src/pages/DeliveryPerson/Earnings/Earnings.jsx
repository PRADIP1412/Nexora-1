import React, { useEffect, useState } from 'react';
import { useEarningsContext } from '../../../context/delivery_panel/EarningsContext';
import DeliveryLayout from '../../../components/DeliveryPerson/Layout/DeliveryLayout';
import EarningsCards from '../../../components/DeliveryPerson/Earnings/EarningsCards';
import EarningsChart from '../../../components/DeliveryPerson/Earnings/EarningsChart';
import EarningsHistory from '../../../components/DeliveryPerson/Earnings/EarningsHistory';
import './Earnings.css';

const Earnings = () => {
    const {
        earningsOverview,
        earningsSummary,
        chartData,
        transactions,
        bankInfo,
        payoutHistory,
        todayEarnings,
        weeklyEarnings,
        monthlyEarnings,
        periodEarnings,
        loading,
        error,
        fetchAllEarningsData,
        fetchChartData,
        fetchTransactions,
        fetchBankInfo,
        downloadStatement,
        clearError
    } = useEarningsContext();

    const [activeChartFilter, setActiveChartFilter] = useState('7 Days');

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAllEarningsData();
                await fetchChartData();
                await fetchTransactions();
                await fetchBankInfo();
            } catch (err) {
                console.error('Error loading earnings data:', err);
            }
        };
        
        loadData();
    }, []);

    const handleChartFilterChange = (filter) => {
        setActiveChartFilter(filter);
        
        let startDate = null;
        let endDate = new Date().toISOString().split('T')[0];
        
        switch(filter) {
            case '7 Days':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
            case '30 Days':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
            case 'This Month':
                const now = new Date();
                startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                break;
        }
        
        if (startDate) {
            fetchChartData(startDate, endDate, filter === 'This Month' ? 'monthly' : 'daily');
        }
    };

    const handleDownloadStatement = () => {
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        downloadStatement(sevenDaysAgo, today, 'csv', true);
    };

    if (loading && !earningsOverview) {
        return (
            <DeliveryLayout>
                <div className="page active" id="earnings-page">
                    <div className="page-header">
                        <h2>Earnings & Payouts</h2>
                    </div>
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading earnings data...</p>
                    </div>
                </div>
            </DeliveryLayout>
        );
    }

    return (
        <DeliveryLayout>
            <div className="page active" id="earnings-page">
                <div className="page-header">
                    <h2>Earnings & Payouts</h2>
                    <button 
                        className="btn-primary" 
                        onClick={handleDownloadStatement}
                        disabled={loading}
                    >
                        <i data-lucide="download"></i>
                        Download Statement
                    </button>
                </div>

                {error && (
                    <div className="error-alert">
                        <div className="alert-content">
                            <i data-lucide="alert-circle"></i>
                            <span>{error}</span>
                        </div>
                        <button className="alert-close" onClick={clearError}>
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                )}

                {/* Earnings Overview */}
                <div className="earnings-overview">
                    <div className="balance-card primary">
                        <div className="card-icon">
                            <i data-lucide="wallet"></i>
                        </div>
                        <div className="card-content">
                            <span className="card-label">Total Earnings (This Month)</span>
                            <span className="card-value">
                                ₹{monthlyEarnings?.total_earnings || earningsOverview?.total_earnings || 0}
                            </span>
                            <span className="card-info">
                                From {monthlyEarnings?.delivery_count || earningsOverview?.delivery_count || 0} deliveries
                            </span>
                        </div>
                    </div>
                    <div className="balance-card success">
                        <div className="card-icon">
                            <i data-lucide="check-circle"></i>
                        </div>
                        <div className="card-content">
                            <span className="card-label">Settled Amount</span>
                            <span className="card-value">
                                ₹{earningsOverview?.settled_amount || 0}
                            </span>
                            <span className="card-info">
                                Last settled: {earningsOverview?.last_settlement_date || 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div className="balance-card warning">
                        <div className="card-icon">
                            <i data-lucide="clock"></i>
                        </div>
                        <div className="card-content">
                            <span className="card-label">Pending Settlement</span>
                            <span className="card-value">
                                ₹{earningsOverview?.pending_amount || 0}
                            </span>
                            <span className="card-info">
                                Next payout: {earningsOverview?.next_payout_date || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Earnings Chart */}
                <EarningsChart 
                    chartData={chartData}
                    loading={loading}
                    activeFilter={activeChartFilter}
                    onFilterChange={handleChartFilterChange}
                />

                {/* Earnings Breakdown */}
                {earningsSummary?.breakdown && earningsSummary.breakdown.length > 0 && (
                    <div className="earnings-breakdown">
                        <h3>Earnings Breakdown</h3>
                        <div className="breakdown-list">
                            {earningsSummary.breakdown.map((item, index) => (
                                <div className="breakdown-item" key={index}>
                                    <div className="breakdown-label">
                                        <i data-lucide={getIconForType(item.type)}></i>
                                        <span>{item.label || getLabelForType(item.type)}</span>
                                    </div>
                                    <span className="breakdown-value">₹{item.amount || 0}</span>
                                </div>
                            ))}
                            <div className="breakdown-item total">
                                <div className="breakdown-label">
                                    <strong>Total Earnings</strong>
                                </div>
                                <span className="breakdown-value">
                                    <strong>₹{earningsOverview?.total_earnings || 0}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transaction History */}
                <EarningsHistory 
                    transactions={transactions}
                    loading={loading}
                />

                {/* Bank Details Card */}
                {bankInfo && (
                    <div className="bank-details-card">
                        <div className="card-header">
                            <h3>Bank Account Details</h3>
                            <button className="btn-text">
                                <i data-lucide="edit"></i>
                                Edit
                            </button>
                        </div>
                        <div className="bank-info">
                            <div className="info-row">
                                <span className="info-label">Account Holder:</span>
                                <span className="info-value">{bankInfo.account_holder || 'Not set'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Bank Name:</span>
                                <span className="info-value">{bankInfo.bank_name || 'Not set'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Account Number:</span>
                                <span className="info-value">
                                    ••••••••{(bankInfo.account_number && typeof bankInfo.account_number === 'string' && bankInfo.account_number.length >= 4) 
                                        ? bankInfo.account_number.slice(-4) 
                                        : 'XXXX'}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">IFSC Code:</span>
                                <span className="info-value">{bankInfo.ifsc_code || 'Not set'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats Cards */}
                <EarningsCards 
                    todayEarnings={todayEarnings}
                    weeklyEarnings={weeklyEarnings}
                    monthlyEarnings={monthlyEarnings}
                    earningsOverview={earningsOverview}
                    loading={loading}
                />

                {/* Payout History */}
                {payoutHistory && payoutHistory.length > 0 && (
                    <div className="payout-history-section">
                        <h3>Recent Payouts</h3>
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
                                    {payoutHistory.slice(0, 5).map((payout, index) => (
                                        <tr key={index}>
                                            <td>{payout.date || payout.payout_date || 'N/A'}</td>
                                            <td>{payout.description || 'Weekly Payout'}</td>
                                            <td>{payout.orders_count || payout.order_count || 0} orders</td>
                                            <td>₹{payout.amount || 0}</td>
                                            <td>
                                                <span className="status-badge success">
                                                    {payout.status || 'Settled'}
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
                )}
            </div>
        </DeliveryLayout>
    );
};

// Helper function to get icons for breakdown types
const getIconForType = (type) => {
    if (!type) return 'dollar-sign';
    
    switch(type.toLowerCase()) {
        case 'base_delivery_fee':
        case 'base fee':
            return 'package';
        case 'peak_hour_bonus':
        case 'peak bonus':
            return 'zap';
        case 'distance_bonus':
        case 'distance bonus':
            return 'navigation';
        case 'rating_bonus':
        case 'rating bonus':
            return 'star';
        case 'incentives':
        case 'incentives_rewards':
            return 'gift';
        default:
            return 'dollar-sign';
    }
};

// Helper function to get labels for breakdown types
const getLabelForType = (type) => {
    if (!type) return 'Other Earnings';
    
    switch(type.toLowerCase()) {
        case 'base_delivery_fee':
        case 'base fee':
            return 'Base Delivery Fee';
        case 'peak_hour_bonus':
        case 'peak bonus':
            return 'Peak Hour Bonus';
        case 'distance_bonus':
        case 'distance bonus':
            return 'Distance Bonus';
        case 'rating_bonus':
        case 'rating bonus':
            return 'Rating Bonus';
        case 'incentives':
        case 'incentives_rewards':
            return 'Incentives & Rewards';
        default:
            return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
};

export default Earnings;