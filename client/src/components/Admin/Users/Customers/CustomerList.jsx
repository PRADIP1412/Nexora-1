import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, User, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import './CustomerList.css';

const CustomerList = () => {
    const { customers, loading, error, fetchCustomers, deleteCustomer } = useCustomerContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Helper function to get customer name
    const getCustomerName = (customer) => {
        // First try to use full_name if it exists
        if (customer.full_name && customer.full_name !== 'Unknown Customer') {
            return customer.full_name;
        }
        
        // Otherwise combine first_name and last_name
        if (customer.first_name || customer.last_name) {
            return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        }
        
        // Fallback to email or unknown
        return customer.email ? `Customer (${customer.email})` : 'Unknown Customer';
    };

    // Helper function to get initials for avatar
    const getCustomerInitials = (customer) => {
        const name = getCustomerName(customer);
        if (name && name !== 'Unknown Customer') {
            // Get first letter of each word
            return name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('')
                .substring(0, 2);
        }
        return customer.email ? customer.email.charAt(0).toUpperCase() : 'U';
    };

    const customerList = Array.isArray(customers) ? customers : [];

    const filteredCustomers = customerList.filter(customer => {
        const customerName = getCustomerName(customer).toLowerCase();
        const customerEmail = customer.email?.toLowerCase() || '';
        const customerPhone = customer.phone || '';
        
        const matchesSearch = 
            customerName.includes(searchTerm.toLowerCase()) ||
            customerEmail.includes(searchTerm.toLowerCase()) ||
            customerPhone.includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' ? customer.is_active : !customer.is_active);
        
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        const nameA = getCustomerName(a);
        const nameB = getCustomerName(b);
        
        switch (sortBy) {
            case 'name':
                return nameA.localeCompare(nameB);
            case 'email':
                return (a.email || '').localeCompare(b.email || '');
            case 'date':
                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            default:
                return 0;
        }
    });

    const handleDelete = async (customerId) => {
        const result = await deleteCustomer(customerId);
        if (result.success) {
            setDeleteConfirm(null);
        }
    };

    const getStatusText = (isActive) => {
        return isActive ? 'Active' : 'Inactive';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading customers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchCustomers} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="customer-list-container">
            <div className="list-header">
                <h1>Customer Management</h1>
                <p>Manage your customers and their information</p>
            </div>

            <div className="controls-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                            <option value="date">Sort by Date</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">
                        <User size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{customerList.length}</h3>
                        <p>Total Customers</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <User size={24} style={{ color: '#4CAF50' }} />
                    </div>
                    <div className="stat-content">
                        <h3>{customerList.filter(c => c.is_active).length}</h3>
                        <p>Active Customers</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Mail size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{new Set(customerList.map(c => c.email)).size}</h3>
                        <p>Unique Emails</p>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="customers-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Customer ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    {customerList.length === 0 ? 'No customers found' : 'No matching customers found'}
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map(customer => {
                                const customerName = getCustomerName(customer);
                                const customerInitials = getCustomerInitials(customer);
                                
                                return (
                                    <tr key={customer.user_id}>
                                        <td>
                                            <div className="customer-info">
                                                <div className="customer-avatar">
                                                    {customerInitials}
                                                </div>
                                                <div className="customer-details">
                                                    <strong>{customerName}</strong>
                                                    {customer.created_at && (
                                                        <span className="customer-date">
                                                            Joined: {new Date(customer.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <div className="contact-item">
                                                    <Mail size={14} />
                                                    <span>{customer.email || 'No email'}</span>
                                                </div>
                                                {customer.phone && (
                                                    <div className="contact-item">
                                                        <Phone size={14} />
                                                        <span>{customer.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${customer.is_active ? 'active' : 'inactive'}`}>
                                                {getStatusText(customer.is_active)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="customer-id-display">
                                                #{customer.user_id}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="action-btn view" 
                                                    title="View Details"
                                                    onClick={() => window.location.href = `/admin/users/customers/${customer.user_id}`}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn edit" 
                                                    title="Edit"
                                                    onClick={() => window.location.href = `/admin/users/customers/edit/${customer.user_id}`}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn delete" 
                                                    title="Delete"
                                                    onClick={() => setDeleteConfirm(customer.user_id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {deleteConfirm && (
                <div className="delete-modal">
                    <div className="modal-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="btn-cancel"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-confirm"
                                onClick={() => handleDelete(deleteConfirm)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerList;