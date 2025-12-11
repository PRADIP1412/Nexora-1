import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import OrderCard from '../../components/Orders/OrderCard';
import { toastInfo, toastError } from '../../utils/customToast';
import './Orders.css';

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  
  const { orders, getUserOrders, loading, error } = useOrder();

  useEffect(() => {
    loadOrders(1);
  }, []);

  const loadOrders = async (pageNum = 1, append = false) => {
    const result = await getUserOrders(pageNum, 10, activeFilter === 'all' ? null : activeFilter);
    if (result.success) {
      setHasMore(result.pagination?.has_next || false);
      setPage(pageNum);
    } else if (!append && result.message) {
      toastError(result.message);
    }
  };

  const filters = [
    { key: 'all', label: 'All Orders', count: orders.length },
    { key: 'PLACED', label: 'Placed', count: orders.filter(o => o.order_status === 'PLACED').length },
    { key: 'PROCESSING', label: 'Processing', count: orders.filter(o => o.order_status === 'PROCESSING').length },
    { key: 'SHIPPED', label: 'Shipped', count: orders.filter(o => o.order_status === 'SHIPPED').length },
    { key: 'DELIVERED', label: 'Delivered', count: orders.filter(o => o.order_status === 'DELIVERED').length },
    { key: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.order_status === 'CANCELLED').length }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.order_status === activeFilter;
    const matchesSearch = order.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.items?.some(item => 
                          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
                        );
    return matchesFilter && matchesSearch;
  });

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/orders/${orderId}/track`);
    toastInfo(`Tracking order ${orderId}`);
  };

  const handleReorder = (orderId) => {
    const order = orders.find(o => o.order_id === orderId);
    if (order) {
      toastInfo(`Added ${order.items.length} items from order ${orderId} to cart`);
    }
  };

  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
    setPage(1);
    loadOrders(1);
  };

  const handleLoadMore = () => {
    loadOrders(page + 1, true);
  };

  if (loading.orders && orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>My Orders</h1>
            <p>Manage and track your orders</p>
          </div>
          <div className="loading-orders">
            {[1, 2, 3].map(i => (
              <div key={i} className="order-card loading">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-id loading-skeleton"></h3>
                    <p className="order-date loading-skeleton"></p>
                  </div>
                  <div className="order-status-badge loading-skeleton"></div>
                </div>
                <div className="order-items-preview">
                  {[1, 2].map(j => (
                    <div key={j} className="order-item-preview loading">
                      <div className="item-image-placeholder loading-skeleton"></div>
                      <div className="item-details">
                        <span className="item-name loading-skeleton"></span>
                        <span className="item-quantity loading-skeleton"></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Manage and track your orders</p>
        </div>

        {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <div className="orders-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search orders by ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="filter-tabs">
            {filters.map(filter => (
              <button
                key={filter.key}
                className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
                onClick={() => handleFilterChange(filter.key)}
              >
                {filter.label}
                <span className="filter-count">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            <>
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.order_id}
                  order={{
                    id: order.order_id,
                    date: order.placed_at,
                    status: order.order_status.toLowerCase(),
                    items: order.items || [],
                    total: order.total_amount,
                    tracking_number: order.tracking_number,
                    delivery_date: order.delivery_date,
                    estimated_delivery: order.estimated_delivery
                  }}
                  onViewOrder={handleViewOrder}
                  onTrackOrder={handleTrackOrder}
                  onReorder={handleReorder}
                />
              ))}
              
              {hasMore && (
                <div className="load-more-section">
                  <button 
                    className="btn-load-more"
                    onClick={handleLoadMore}
                    disabled={loading.orders}
                  >
                    {loading.orders ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading...
                      </>
                    ) : (
                      'Load More Orders'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-orders">
              <i className="fas fa-shopping-bag"></i>
              <h3>No orders found</h3>
              <p>
                {searchTerm 
                  ? `No orders matching "${searchTerm}"`
                  : `No ${activeFilter !== 'all' ? activeFilter.toLowerCase() : ''} orders found`
                }
              </p>
              <button 
                className="btn-shop-now"
                onClick={() => navigate('/products')}
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;