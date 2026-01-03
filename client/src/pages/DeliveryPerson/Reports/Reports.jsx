import React, { useEffect, useState } from 'react';
import { useDeliveryReportsContext } from '../../../context/delivery_panel/DeliveryReportsContext';
import DeliveryLayout from '../../../components/DeliveryPerson/Layout/DeliveryLayout';
import ReportsHeader from '../../../components/DeliveryPerson/Reports/ReportsHeader';
import ReportsFilters from '../../../components/DeliveryPerson/Reports/ReportsFilters';
import ReportsSummary from '../../../components/DeliveryPerson/Reports/ReportsSummary';
import ReportsTrend from '../../../components/DeliveryPerson/Reports/ReportsTrend';
import ReportsTable from '../../../components/DeliveryPerson/Reports/ReportsTable';
import './Reports.css';

const Reports = () => {
    const {
        reportsData,
        summaryData,
        trendData,
        ordersData,
        loading,
        error,
        exportSuccess,
        activeFilters,
        fetchAllReportsData,
        fetchDeliveryReports,
        fetchDeliverySummary,
        fetchDeliveryTrend,
        fetchOrderWiseReport,
        exportReport,
        updateFilters,
        clearError,
        clearAllData
    } = useDeliveryReportsContext();

    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [periodFilter, setPeriodFilter] = useState('Overall');

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAllReportsData();
            } catch (err) {
                console.error('Error loading reports data:', err);
            }
        };
        
        loadData();
        
        // Set default date range (last 30 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setDateRange({ startDate, endDate });
    }, []);

    const handleFilterChange = async () => {
        const filters = {};
        
        if (dateRange.startDate && dateRange.endDate) {
            filters.startDate = dateRange.startDate;
            filters.endDate = dateRange.endDate;
        }
        
        if (statusFilter !== 'All Status') {
            filters.status = statusFilter;
        }
        
        if (periodFilter !== 'Overall') {
            filters.range = periodFilter.toLowerCase();
        }
        
        updateFilters(filters);
        
        try {
            await fetchDeliveryReports(filters);
            await fetchOrderWiseReport(filters);
        } catch (err) {
            console.error('Error applying filters:', err);
        }
    };

    const handlePeriodChange = (period) => {
        setPeriodFilter(period);
        
        const now = new Date();
        let startDate = '';
        let endDate = now.toISOString().split('T')[0];
        
        switch(period) {
            case 'Weekly':
                startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
                break;
            case 'Monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
                break;
            case 'Custom Range':
                // Don't auto-set dates for custom range
                break;
            default: // Overall
                startDate = '';
                endDate = '';
        }
        
        if (startDate) {
            setDateRange({ startDate, endDate });
        }
    };

    const handleExportReport = async () => {
        const params = {
            report_format: 'pdf',
            report_range: periodFilter.toLowerCase(),
            export_type: 'full'
        };
        
        if (dateRange.startDate && dateRange.endDate) {
            params.start_date = dateRange.startDate;
            params.end_date = dateRange.endDate;
        }
        
        if (statusFilter !== 'All Status') {
            params.status_filter = statusFilter;
        }
        
        await exportReport(params);
    };

    const handleClearFilters = () => {
        setDateRange({ startDate: '', endDate: '' });
        setStatusFilter('All Status');
        setPeriodFilter('Overall');
        clearAllData();
        fetchAllReportsData();
    };

    if (loading && !reportsData) {
        return (
            <DeliveryLayout>
                <div className="page active" id="reports-page">
                    <div className="page-header">
                        <h2>Delivery Reports</h2>
                    </div>
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading reports data...</p>
                    </div>
                </div>
            </DeliveryLayout>
        );
    }

    return (
        <DeliveryLayout>
            <div className="page active" id="reports-page">
                {/* Page Header */}
                <ReportsHeader 
                    periodFilter={periodFilter}
                    onPeriodChange={handlePeriodChange}
                    onExport={handleExportReport}
                    exportSuccess={exportSuccess}
                    loading={loading}
                />

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

                {exportSuccess && (
                    <div className="success-alert">
                        <div className="alert-content">
                            <i data-lucide="check-circle"></i>
                            <span>Report exported successfully!</span>
                        </div>
                        <button className="alert-close" onClick={clearError}>
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                )}

                {/* Filters Section */}
                <ReportsFilters 
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    onApplyFilters={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    loading={loading}
                />

                {/* Summary Cards */}
                <ReportsSummary 
                    summaryData={summaryData}
                    reportsData={reportsData}
                    loading={loading}
                />

                {/* Trend Section */}
                <ReportsTrend 
                    trendData={trendData}
                    reportsData={reportsData}
                    loading={loading}
                />

                {/* Period Breakdown Table */}
                {reportsData?.period_breakdown && reportsData.period_breakdown.length > 0 && (
                    <div className="breakdown-section">
                        <h3>📅 Period-wise Breakdown</h3>
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Period</th>
                                        <th>Total</th>
                                        <th>Completed</th>
                                        <th>Failed</th>
                                        <th>Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportsData.period_breakdown.map((period, index) => (
                                        <tr key={index}>
                                            <td>{period.period || 'N/A'}</td>
                                            <td>{period.total_orders || period.total_deliveries || 0}</td>
                                            <td className="text-green">
                                                {period.completed || period.completed_deliveries || 0}
                                            </td>
                                            <td className="text-red">
                                                {period.failed || period.failed_deliveries || 0}
                                            </td>
                                            <td>₹{period.earnings || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Order-wise Report Table */}
                <ReportsTable 
                    ordersData={ordersData}
                    loading={loading}
                    onRefresh={handleFilterChange}
                />

                {/* Footer Info */}
                <div className="reports-footer">
                    <p>
                        <i data-lucide="info"></i>
                        Reports are generated based on completed delivery data only.
                    </p>
                </div>
            </div>
        </DeliveryLayout>
    );
};

export default Reports;