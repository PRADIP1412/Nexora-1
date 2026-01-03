import React, { useEffect, useState } from 'react';
import { useOrderAdminContext } from '../../../context/OrderAdminContext';
import OrdersAnalytics from '../../../components/Admin/Orders/Analytics/OrdersAnalytics';
import DateRangeFilter from '../../../components/Admin/Orders/Analytics/DateRangeFilter';
import './OrderAnalytics.css';

const OrderAnalytics = () => {
    const { 
        stats, 
        loading, 
        error, 
        fetchOrderStats,
        fetchOrdersByDate,
        clearError 
    } = useOrderAdminContext();
    
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [ordersByDate, setOrdersByDate] = useState([]);

    useEffect(() => {
        fetchOrderStats();
        loadOrdersByDate();
    }, []);

    const loadOrdersByDate = async () => {
        const result = await fetchOrdersByDate(dateRange.startDate, dateRange.endDate);
        if (result.success) {
            setOrdersByDate(result.data);
        }
    };

    const handleDateRangeChange = (newDateRange) => {
        setDateRange(newDateRange);
    };

    const handleApplyDateRange = () => {
        loadOrdersByDate();
    };

    if (loading && !stats) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Order Analytics</h1>
                <p className="text-gray-600 mt-2">Insights and statistics for order management</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex justify-between items-center">
                        <p className="text-red-700">{error}</p>
                        <button 
                            onClick={clearError}
                            className="text-red-700 hover:text-red-900"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <DateRangeFilter 
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    onApply={handleApplyDateRange}
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <OrdersAnalytics 
                    stats={stats}
                    ordersByDate={ordersByDate}
                    dateRange={dateRange}
                />
            </div>
        </div>
    );
};

export default OrderAnalytics;