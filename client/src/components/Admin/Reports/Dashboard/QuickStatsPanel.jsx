import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import { 
  FaExclamationTriangle, 
  FaBox, 
  FaClock, 
  FaCheckCircle,
  FaShoppingBag,
  FaUserCheck,
  FaTruckLoading
} from 'react-icons/fa';

const QuickStatsPanel = ({ dateRange }) => {
  const {
    salesReports,
    productReports,
    customerReports,
    loading,
    getOrderStatusSummary,
    getLowStockAlerts,
    getCustomerFeedbackSummary,
    getReturnsSummary
  } = useReportsContext();

  const [stats, setStats] = useState({
    lowStock: 0,
    pendingOrders: 0,
    returns: 0,
    positiveFeedback: 0,
    urgentItems: 0,
    newCustomers: 0
  });

  useEffect(() => {
    const loadQuickStats = async () => {
      try {
        const [
          ordersResult,
          stockResult,
          feedbackResult,
          returnsResult
        ] = await Promise.allSettled([
          getOrderStatusSummary(dateRange.startDate, dateRange.endDate),
          getLowStockAlerts(10),
          getCustomerFeedbackSummary(dateRange.startDate, dateRange.endDate),
          getReturnsSummary(dateRange.startDate, dateRange.endDate)
        ]);

        // Parse order status
        let pendingOrders = 0;
        if (ordersResult.status === 'fulfilled' && ordersResult.value.success) {
          const orderData = ordersResult.value.data || [];
          const pending = orderData.find(item => item.status === 'pending' || item.status === 'processing');
          pendingOrders = pending?.count || 0;
        }

        // Parse low stock
        let lowStock = 0;
        if (stockResult.status === 'fulfilled' && stockResult.value.success) {
          const stockData = stockResult.value.data || [];
          lowStock = stockData.length || 0;
        }

        // Parse feedback
        let positiveFeedback = 0;
        if (feedbackResult.status === 'fulfilled' && feedbackResult.value.success) {
          const feedbackData = feedbackResult.value.data;
          if (feedbackData && feedbackData.positive_feedback) {
            positiveFeedback = feedbackData.positive_feedback;
          }
        }

        // Parse returns
        let returns = 0;
        if (returnsResult.status === 'fulfilled' && returnsResult.value.success) {
          const returnsData = returnsResult.value.data;
          if (returnsData && returnsData.total_returns) {
            returns = returnsData.total_returns;
          }
        }

        setStats({
          lowStock,
          pendingOrders,
          returns,
          positiveFeedback,
          urgentItems: lowStock > 5 ? lowStock : 0,
          newCustomers: 0 // Would need additional API call
        });
      } catch (error) {
        console.error('Quick stats load error:', error);
      }
    };

    loadQuickStats();
  }, [dateRange, getOrderStatusSummary, getLowStockAlerts, getCustomerFeedbackSummary, getReturnsSummary]);

  const statItems = [
    {
      id: 'lowStock',
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: <FaBox className={stats.lowStock > 5 ? 'text-red-600' : 'text-yellow-600'} />,
      color: stats.lowStock > 5 ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100',
      priority: stats.lowStock > 5 ? 'high' : 'medium'
    },
    {
      id: 'pendingOrders',
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <FaClock className="text-blue-600" />,
      color: 'bg-blue-50 border-blue-100',
      priority: 'medium'
    },
    {
      id: 'returns',
      title: 'Recent Returns',
      value: stats.returns,
      icon: <FaShoppingBag className="text-purple-600" />,
      color: 'bg-purple-50 border-purple-100',
      priority: 'low'
    },
    {
      id: 'positiveFeedback',
      title: 'Positive Feedback',
      value: stats.positiveFeedback,
      icon: <FaCheckCircle className="text-green-600" />,
      color: 'bg-green-50 border-green-100',
      priority: 'low'
    },
    {
      id: 'urgentItems',
      title: 'Urgent Alerts',
      value: stats.urgentItems,
      icon: <FaExclamationTriangle className="text-red-600" />,
      color: 'bg-red-50 border-red-100',
      priority: 'high',
      hidden: stats.urgentItems === 0
    },
    {
      id: 'newCustomers',
      title: 'New Customers',
      value: stats.newCustomers,
      icon: <FaUserCheck className="text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-100',
      priority: 'low'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const visibleStats = statItems.filter(item => !item.hidden);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {visibleStats.map((stat) => (
        <div
          key={stat.id}
          className={`rounded-xl border p-4 ${stat.color} ${
            stat.priority === 'high' ? 'ring-1 ring-red-200' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">{stat.title}</span>
            <div className={`p-2 rounded-lg ${
              stat.priority === 'high' ? 'bg-red-100' : 
              stat.priority === 'medium' ? 'bg-yellow-100' : 
              'bg-gray-100'
            }`}>
              {stat.icon}
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
            {stat.priority === 'high' && (
              <span className="ml-2 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                Urgent
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsPanel;