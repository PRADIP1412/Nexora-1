import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderAdminContext } from '../../../context/OrderAdminContext';
import Filters from '../../../components/Admin/Orders/common/Filters';
import OrdersTable from '../../../components/Admin/Orders/OrderList/OrdersTable';
import Pagination from '../../../components/Admin/Orders/common/Pagination';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const { 
        orders, 
        loading, 
        error, 
        fetchAllOrders, 
        pagination,
        clearError 
    } = useOrderAdminContext();
    
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    });

    // Fetch all orders on component mount
    useEffect(() => {
        fetchAllOrders(pagination.page, pagination.perPage, '');
    }, []);

    // Filter orders based on search criteria (client-side)
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];
        
        return orders.filter(order => {
            // Filter by status
            const matchesStatus = !filters.status || order.order_status === filters.status;
            
            // Filter by search term
            const matchesSearch = !filters.search || 
                // Search by order ID
                order.order_id.toString().includes(filters.search) ||
                // Search by customer ID
                order.user_id.toString().includes(filters.search) ||
                // Search by customer name (if available)
                (order.user?.name && order.user.name.toLowerCase().includes(filters.search.toLowerCase())) ||
                // Search by customer email (if available)
                (order.user?.email && order.user.email.toLowerCase().includes(filters.search.toLowerCase()));
            
            // Filter by date range
            let matchesDate = true;
            if (filters.startDate || filters.endDate) {
                const orderDate = new Date(order.placed_at);
                const startDate = filters.startDate ? new Date(filters.startDate) : null;
                const endDate = filters.endDate ? new Date(filters.endDate) : null;
                
                if (startDate) {
                    startDate.setHours(0, 0, 0, 0);
                }
                if (endDate) {
                    endDate.setHours(23, 59, 59, 999);
                }
                
                if (startDate && endDate) {
                    matchesDate = orderDate >= startDate && orderDate <= endDate;
                } else if (startDate) {
                    matchesDate = orderDate >= startDate;
                } else if (endDate) {
                    matchesDate = orderDate <= endDate;
                }
            }
            
            return matchesStatus && matchesSearch && matchesDate;
        });
    }, [orders, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        // Client-side filtering happens automatically in filteredOrders
        console.log('Searching with filters:', filters);
    };

    const handleClearSearch = () => {
        setFilters({
            status: '',
            search: '',
            startDate: '',
            endDate: ''
        });
    };

    const handleViewOrder = (orderId) => {
        navigate(`/admin/orders/${orderId}`);
    };

    // Since we're doing client-side filtering, we need to handle pagination manually
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = pagination.perPage;

    // Calculate paginated orders
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredOrders.slice(startIndex, endIndex);
    }, [filteredOrders, currentPage, itemsPerPage]);

    // Calculate total pages for filtered results
    const totalFilteredPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    if (loading && !orders.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
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

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <Filters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    onClearSearch={handleClearSearch}
                />
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {paginatedOrders.length} of {filteredOrders.length} orders
                        {filters.search && (
                            <span className="ml-2">
                                (searching for: <span className="font-medium">"{filters.search}"</span>)
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => fetchAllOrders(pagination.page, pagination.perPage, filters.status)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Refresh Orders
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <OrdersTable 
                    orders={paginatedOrders}
                    onViewOrder={handleViewOrder}
                    loading={loading}
                />
                
                {filteredOrders.length > 0 && (
                    <div className="px-6 py-4 border-t">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalFilteredPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
                
                {filteredOrders.length === 0 && !loading && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No orders found matching your criteria.</p>
                        {filters.search || filters.status || filters.startDate || filters.endDate ? (
                            <button
                                onClick={handleClearSearch}
                                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800"
                            >
                                Clear all filters
                            </button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;