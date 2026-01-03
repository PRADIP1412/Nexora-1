import React, { useState, useEffect } from 'react';
import { useDeliveryPersonContext } from '../../../../context/DeliveryPersonContext';
import { 
  Search, Filter, Eye, Edit, Trash2, 
  User, Phone, Star, MapPin, Clock, DollarSign, 
  CheckCircle, XCircle, AlertCircle, Bike, Car,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DeliveryPersonList.css';

const DeliveryPersonList = () => {
    const { deliveryPersons, loading, error, fetchDeliveryPersons, deleteDeliveryPerson } = useDeliveryPersonContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeliveryPersons();
    }, [fetchDeliveryPersons]);

    // Helper function to safely parse rating
    const getRatingValue = (rating) => {
        if (!rating && rating !== 0) return 'N/A';
        const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
        return isNaN(numRating) ? 'N/A' : numRating.toFixed(1);
    };

    // Helper function to safely format earnings
    const getEarningsValue = (earnings) => {
        if (!earnings && earnings !== 0) return '0.00';
        const numEarnings = typeof earnings === 'string' ? parseFloat(earnings) : earnings;
        return isNaN(numEarnings) ? '0.00' : numEarnings.toFixed(2);
    };

    // Helper function to parse number safely
    const parseNumber = (value) => {
        if (!value && value !== 0) return 0;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    };

    const filteredDeliveryPersons = deliveryPersons.filter(person => {
        const matchesSearch = 
            (person.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.phone?.includes(searchTerm) ||
            person.license_number?.includes(searchTerm)) || false;
        
        const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.user_name || '').localeCompare(b.user_name || '');
            case 'rating':
                return parseNumber(b.rating) - parseNumber(a.rating);
            case 'deliveries':
                return (b.total_deliveries || 0) - (a.total_deliveries || 0);
            case 'earnings':
                return parseNumber(b.total_earnings) - parseNumber(a.total_earnings);
            default:
                return 0;
        }
    });

    const handleDelete = async (deliveryPersonId) => {
        const result = await deleteDeliveryPerson(deliveryPersonId);
        if (result.success) {
            setDeleteConfirm(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircle size={14} className="status-icon active" />;
            case 'INACTIVE': return <XCircle size={14} className="status-icon inactive" />;
            case 'SUSPENDED': return <AlertCircle size={14} className="status-icon suspended" />;
            case 'PENDING': return <Clock size={14} className="status-icon pending" />;
            default: return null;
        }
    };

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType?.toLowerCase()) {
            case 'bike': return <Bike size={14} />;
            case 'car': return <Car size={14} />;
            case 'motorcycle': return <Bike size={14} />;
            default: return <MapPin size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading delivery persons...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchDeliveryPersons} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="delivery-person-list-container">
            <div className="list-header">
                <h1>Delivery Persons Management</h1>
                <p>Manage your delivery team and their performance</p>
                <button 
                    className="btn-create"
                    onClick={() => navigate('/admin/users/delivery-persons/create')}
                >
                    <Plus size={16} /> Add Delivery Person
                </button>
            </div>

            <div className="controls-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search delivery persons..."
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
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="deliveries">Sort by Deliveries</option>
                            <option value="earnings">Sort by Earnings</option>
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
                        <h3>{deliveryPersons.length}</h3>
                        <p>Total Delivery Persons</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>${deliveryPersons.reduce((sum, p) => sum + parseNumber(p.total_earnings), 0).toFixed(2)}</h3>
                        <p>Total Earnings</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <MapPin size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{deliveryPersons.reduce((sum, p) => sum + (p.total_deliveries || 0), 0)}</h3>
                        <p>Total Deliveries</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Star size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{(deliveryPersons.reduce((sum, p) => sum + parseNumber(p.rating), 0) / (deliveryPersons.length || 1)).toFixed(1)}</h3>
                        <p>Average Rating</p>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="delivery-persons-table">
                    <thead>
                        <tr>
                            <th>Delivery Person</th>
                            <th>Contact</th>
                            <th>Performance</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDeliveryPersons.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    No delivery persons found
                                </td>
                            </tr>
                        ) : (
                            filteredDeliveryPersons.map(person => (
                                <tr key={person.delivery_person_id}>
                                    <td>
                                        <div className="person-info">
                                            <div className="person-avatar">
                                                {person.user_name?.[0]?.toUpperCase() || 'D'}
                                            </div>
                                            <div className="person-details">
                                                <strong>{person.user_name || 'Unknown'}</strong>
                                                <span className="person-id">ID: {person.delivery_person_id}</span>
                                                <div className="person-meta">
                                                    {getVehicleIcon(person.vehicle_type)}
                                                    <span>{person.vehicle_type || 'No vehicle'}</span>
                                                    <span className="license">
                                                        {person.license_number ? `License: ${person.license_number}` : 'No license'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <div className="contact-item">
                                                <Phone size={14} />
                                                <span>{person.phone || 'Not provided'}</span>
                                            </div>
                                            <div className="contact-item">
                                                <span className="email">{person.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="performance-info">
                                            <div className="performance-item">
                                                <Star size={14} />
                                                <span className="rating">
                                                    {getRatingValue(person.rating)}
                                                    <span className="rating-count">({person.total_deliveries || 0} deliveries)</span>
                                                </span>
                                            </div>
                                            <div className="performance-item">
                                                <DollarSign size={14} />
                                                <span className="earnings">${getEarningsValue(person.total_earnings)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-badge ${person.status}`}>
                                            {getStatusIcon(person.status)}
                                            <span>{person.status}</span>
                                        </div>
                                        {person.joined_at && (
                                            <div className="joined-date">
                                                Joined: {new Date(person.joined_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="action-btn view" 
                                                title="View Details"
                                                onClick={() => navigate(`/admin/users/delivery-persons/${person.delivery_person_id}`)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                className="action-btn edit" 
                                                title="Edit"
                                                onClick={() => navigate(`/admin/users/delivery-persons/edit/${person.delivery_person_id}`)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="action-btn delete" 
                                                title="Delete"
                                                onClick={() => setDeleteConfirm(person.delivery_person_id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {deleteConfirm && (
                <div className="delete-modal">
                    <div className="modal-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to deactivate this delivery person? This will set their status to INACTIVE.</p>
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
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryPersonList;