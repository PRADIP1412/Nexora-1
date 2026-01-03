import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportTable from '../Common/ReportTable';
import ReportChart from '../Common/ReportChart';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaShoppingCart,
  FaDollarSign,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const CustomersView = ({ dateRange }) => {
  const {
    customerReports,
    loading,
    getAllCustomersReport,
    getCustomerOrdersReport
  } = useReportsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, [dateRange]);

  useEffect(() => {
    if (customerReports.allCustomers?.length > 0) {
      const topCustomers = customerReports.allCustomers
        .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
        .slice(0, 5);
      
      // Simulate customer orders for top customers
      setCustomerOrders(topCustomers.map(customer => ({
        customer_name: customer.customer_name,
        total_orders: customer.total_orders || 0,
        total_spent: customer.total_spent || 0,
        avg_order_value: customer.total_orders > 0 ? (customer.total_spent || 0) / customer.total_orders : 0,
        last_order_date: customer.last_order || 'N/A'
      })));
    }
  }, [customerReports.allCustomers]);

  const loadCustomers = async () => {
    await getAllCustomersReport();
  };

  const customerColumns = [
    { 
      field: 'customer_name', 
      header: 'Customer',
      width: '25%',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <FaUser className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{value}</p>
            <p className="text-xs text-gray-600">{row.email}</p>
          </div>
        </div>
      )
    },
    { field: 'join_date', header: 'Join Date' },
    { field: 'total_orders', header: 'Orders', render: (value) => (
      <span className="font-medium">{value.toLocaleString()}</span>
    )},
    { field: 'total_spent', header: 'Total Spent', render: (value) => (
      <span className="font-bold text-green-600">${value.toLocaleString()}</span>
    )},
    { field: 'last_order', header: 'Last Order' },
    { field: 'segment', header: 'Segment', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'vip' ? 'bg-purple-100 text-purple-800' :
        value === 'returning' ? 'bg-green-100 text-green-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {value}
      </span>
    )}
  ];

  const topCustomerColumns = [
    { field: 'customer_name', header: 'Customer' },
    { field: 'total_orders', header: 'Orders' },
    { field: 'total_spent', header: 'Total Spent', render: (value) => `$${value.toLocaleString()}` },
    { field: 'avg_order_value', header: 'Avg Order', render: (value) => `$${value.toFixed(2)}` },
    { field: 'last_order_date', header: 'Last Order' }
  ];

  const segments = [
    { id: 'all', label: 'All Customers' },
    { id: 'new', label: 'New Customers' },
    { id: 'returning', label: 'Returning' },
    { id: 'vip', label: 'VIP' },
    { id: 'inactive', label: 'Inactive' }
  ];

  const filteredCustomers = (customerReports.allCustomers || []).filter(customer => {
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!customer.customer_name?.toLowerCase().includes(term) &&
          !customer.email?.toLowerCase().includes(term)) {
        return false;
      }
    }
    
    // Apply segment filter
    if (segmentFilter !== 'all') {
      if (segmentFilter === 'new') {
        // Assuming new customers joined in last 30 days
        const joinDate = new Date(customer.join_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (joinDate < thirtyDaysAgo) return false;
      } else if (segmentFilter === 'inactive') {
        // Assuming inactive = no order in last 90 days
        const lastOrder = new Date(customer.last_order);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (lastOrder > ninetyDaysAgo) return false;
      } else if (customer.segment !== segmentFilter) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate customer segments for chart
  const segmentData = segments.map(segment => {
    if (segment.id === 'all') return null;
    
    let count = 0;
    if (segment.id === 'new') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      count = filteredCustomers.filter(c => new Date(c.join_date) >= thirtyDaysAgo).length;
    } else if (segment.id === 'inactive') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      count = filteredCustomers.filter(c => {
        const lastOrder = new Date(c.last_order);
        return lastOrder < ninetyDaysAgo;
      }).length;
    } else {
      count = filteredCustomers.filter(c => c.segment === segment.id).length;
    }
    
    return {
      label: segment.label,
      value: count
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customer Directory</h2>
          <p className="text-gray-600">Manage and analyze all customers</p>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredCustomers.length}</span> customers
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {segments.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportChart
            title="Customer Segments"
            data={segmentData}
            type="pie"
            height={300}
            loading={loading}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">{filteredCustomers.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Orders per Customer</p>
              <p className="text-2xl font-bold text-gray-800">
                {filteredCustomers.length > 0
                  ? (filteredCustomers.reduce((sum, c) => sum + (c.total_orders || 0), 0) / filteredCustomers.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Lifetime Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${filteredCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <ReportTable
        title="Top Customers by Spend"
        data={customerOrders}
        columns={topCustomerColumns}
        loading={loading}
        emptyMessage="No customer data available"
        showPagination={false}
      />

      {/* All Customers Table */}
      <ReportTable
        title="All Customers"
        data={filteredCustomers}
        columns={customerColumns}
        loading={loading}
        emptyMessage="No customers found"
      />
    </div>
  );
};

export default CustomersView;