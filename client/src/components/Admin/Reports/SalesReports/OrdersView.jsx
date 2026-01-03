import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportTable from '../Common/ReportTable';
import FilterPanel from '../Common/FilterPanel';
import ExportControls from '../Common/ExportControls';
import { FaSearch, FaFilter, FaEye, FaFileInvoiceDollar } from 'react-icons/fa';

const OrdersView = ({ dateRange }) => {
  const {
    salesReports,
    loading,
    getAllOrdersReport,
    getOrderItemsDetail,
    exportReport
  } = useReportsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    loadOrders();
  }, [dateRange]);

  const loadOrders = async () => {
    await getAllOrdersReport(dateRange.startDate, dateRange.endDate);
  };

  const loadOrderItems = async (orderId) => {
    const result = await getOrderItemsDetail(dateRange.startDate, dateRange.endDate);
    if (result.success && result.data) {
      const items = result.data.filter(item => item.order_id === orderId);
      setOrderItems(items);
    }
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    await loadOrderItems(order.order_id);
  };

  const handleExport = async (format) => {
    await exportReport('orders', format, dateRange.startDate, dateRange.endDate);
  };

  const orderColumns = [
    { field: 'order_id', header: 'Order ID' },
    { field: 'customer_name', header: 'Customer' },
    { field: 'date', header: 'Date' },
    { field: 'amount', header: 'Amount', render: (value) => `$${value}` },
    { field: 'status', header: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'completed' ? 'bg-green-100 text-green-800' :
        value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        value === 'cancelled' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
    { field: 'payment_method', header: 'Payment' },
    { 
      field: 'actions', 
      header: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleViewOrder(row)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
        >
          <FaEye className="inline mr-1" />
          View
        </button>
      )
    }
  ];

  const orderItemColumns = [
    { field: 'product_name', header: 'Product' },
    { field: 'quantity', header: 'Qty' },
    { field: 'unit_price', header: 'Unit Price', render: (value) => `$${value}` },
    { field: 'total_price', header: 'Total', render: (value) => `$${value}` },
    { field: 'category', header: 'Category' }
  ];

  const orderFilters = [
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'completed', label: 'Completed' },
      { value: 'pending', label: 'Pending' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'processing', label: 'Processing' }
    ]},
    { key: 'payment', label: 'Payment Method', type: 'select', options: [
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash' }
    ]},
    { key: 'minAmount', label: 'Min Amount', type: 'number', placeholder: '0' },
    { key: 'maxAmount', label: 'Max Amount', type: 'number', placeholder: '10000' }
  ];

  const filteredOrders = (salesReports.allOrders || []).filter(order => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.order_id?.toLowerCase().includes(term) ||
        order.customer_name?.toLowerCase().includes(term) ||
        order.status?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>
        <ExportControls
          onExport={handleExport}
          fileName={`orders_${new Date().toISOString().split('T')[0]}`}
          disabled={loading}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaFilter />
            <span>{filteredOrders.length} orders found</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={orderFilters}
        onFilterChange={setFilters}
        onApply={() => console.log('Order filters applied:', filters)}
        onReset={() => setFilters({})}
        loading={loading}
      />

      {/* Orders Table */}
      <ReportTable
        title="All Orders"
        data={filteredOrders}
        columns={orderColumns}
        loading={loading}
        emptyMessage="No orders found"
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Order #{selectedOrder.order_id}
                </h3>
                <p className="text-sm text-gray-600">{selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Customer Information</h4>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Shipping Address</h4>
                    <p className="text-sm text-gray-800">{selectedOrder.shipping_address}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Information</h4>
                    <p className="font-medium">{selectedOrder.payment_method}</p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={`font-medium ${
                        selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedOrder.payment_status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Order Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h4>
                <ReportTable
                  data={orderItems}
                  columns={orderItemColumns}
                  loading={loading}
                  emptyMessage="No items found for this order"
                  showPagination={false}
                  className="border-0 shadow-none"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${selectedOrder.amount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${selectedOrder.shipping_cost || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${selectedOrder.tax || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-gray-800">
                    ${(parseFloat(selectedOrder.amount) + 
                       parseFloat(selectedOrder.shipping_cost || 0) + 
                       parseFloat(selectedOrder.tax || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FaFileInvoiceDollar className="inline mr-2" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;