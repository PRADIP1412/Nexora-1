import React, { useState } from 'react';
import './ProductFilters.css';

const ProductFilters = ({ filters, onFilterChange, onSearch, onClearFilters }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showPerPageMenu, setShowPerPageMenu] = useState(false);
    
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A to Z' },
        { value: 'name_desc', label: 'Name: Z to A' },
        { value: 'discount_desc', label: 'Discount: High to Low' }
    ];
    
    const statusOptions = [
        { value: '', label: 'All Status', color: '#667eea' },
        { value: 'ACTIVE', label: 'Active', color: '#10b981' },
        { value: 'INACTIVE', label: 'Inactive', color: '#9ca3af' },
        { value: 'OUT_OF_STOCK', label: 'Out of Stock', color: '#ef4444' }
    ];
    
    const perPageOptions = [12, 24, 36, 48, 96];
    
    const getSortLabel = (value) => {
        return sortOptions.find(opt => opt.value === value)?.label || 'Sort By';
    };
    
    const getStatusLabel = (value) => {
        return statusOptions.find(opt => opt.value === value)?.label || 'All Status';
    };
    
    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            console.log("🔍 FILTERS: Searching for:", searchTerm);
            onSearch(searchTerm);
        }
    };
    
    const handleSortSelect = (sortBy) => {
        console.log("🔍 FILTERS: Setting sort to:", sortBy);
        onFilterChange({ sort_by: sortBy });
        setShowSortMenu(false);
    };
    
    const handleStatusSelect = (status) => {
        console.log("🔍 FILTERS: Setting status to:", status);
        onFilterChange({ status: status === '' ? undefined : status });
        setShowStatusMenu(false);
    };
    
    const handlePerPageSelect = (perPage) => {
        console.log("🔍 FILTERS: Setting per_page to:", perPage);
        onFilterChange({ per_page: perPage });
        setShowPerPageMenu(false);
    };
    
    const hasActiveFilters = () => {
        return filters.search || filters.sort_by !== 'newest' || filters.status;
    };

    return (
        <div className="product-filters-admin">
            <div className="filters-header">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search products by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        {searchTerm && (
                            <button 
                                className="clear-search-btn"
                                onClick={() => {
                                    console.log("🔍 FILTERS: Clearing search");
                                    setSearchTerm('');
                                    onSearch('');
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                        <button 
                            className="search-btn"
                            onClick={() => {
                                console.log("🔍 FILTERS: Manual search click");
                                onSearch(searchTerm);
                            }}
                        >
                            <i className="fas fa-search"></i>
                            Search
                        </button>
                    </div>
                </div>
                
                <div className="filter-controls">
                    <div className="filter-dropdown-wrapper">
                        <button 
                            className="filter-toggle"
                            onClick={() => setShowSortMenu(!showSortMenu)}
                        >
                            <span>
                                <i className="fas fa-sort-amount-down"></i>
                                {getSortLabel(filters.sort_by || 'newest')}
                            </span>
                            <i className={`fas fa-chevron-${showSortMenu ? 'up' : 'down'}`}></i>
                        </button>
                        
                        {showSortMenu && (
                            <div className="filter-menu">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`sort-option ${filters.sort_by === option.value ? 'active' : ''}`}
                                        onClick={() => handleSortSelect(option.value)}
                                    >
                                        {option.label}
                                        {filters.sort_by === option.value && (
                                            <i className="fas fa-check"></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="filter-dropdown-wrapper">
                        <button 
                            className="filter-toggle"
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                        >
                            <span>
                                <i className="fas fa-filter"></i>
                                {getStatusLabel(filters.status || '')}
                            </span>
                            <i className={`fas fa-chevron-${showStatusMenu ? 'up' : 'down'}`}></i>
                        </button>
                        
                        {showStatusMenu && (
                            <div className="filter-menu">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`status-option ${filters.status === option.value ? 'active' : ''}`}
                                        onClick={() => handleStatusSelect(option.value)}
                                    >
                                        <span 
                                            className="status-dot" 
                                            style={{ backgroundColor: option.color }}
                                        ></span>
                                        {option.label}
                                        {filters.status === option.value ? (
                                            <i className="fas fa-check"></i>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="filter-dropdown-wrapper">
                        <button 
                            className="filter-toggle"
                            onClick={() => setShowPerPageMenu(!showPerPageMenu)}
                        >
                            <span>
                                <i className="fas fa-list-ol"></i>
                                Show: {filters.per_page || 12}
                            </span>
                            <i className={`fas fa-chevron-${showPerPageMenu ? 'up' : 'down'}`}></i>
                        </button>
                        
                        {showPerPageMenu && (
                            <div className="filter-menu">
                                {perPageOptions.map((option) => (
                                    <button
                                        key={option}
                                        className={`perpage-option ${(filters.per_page || 12) === option ? 'active' : ''}`}
                                        onClick={() => handlePerPageSelect(option)}
                                    >
                                        {option} per page
                                        {(filters.per_page || 12) === option && (
                                            <i className="fas fa-check"></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {hasActiveFilters() && (
                        <button className="clear-filters-btn" onClick={() => {
                            console.log("🔍 FILTERS: Clearing all filters");
                            onClearFilters();
                            setSearchTerm('');
                        }}>
                            <i className="fas fa-times"></i>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>
            
            {hasActiveFilters() && (
                <div className="active-filters">
                    <span className="active-filters-label">Active Filters:</span>
                    <div className="filter-tags">
                        {filters.search && (
                            <span className="filter-tag">
                                Search: "{filters.search}"
                                <button onClick={() => {
                                    console.log("🔍 FILTERS: Removing search filter");
                                    onSearch('');
                                    setSearchTerm('');
                                }} className="remove-filter">
                                    <i className="fas fa-times"></i>
                                </button>
                            </span>
                        )}
                        
                        {filters.sort_by && filters.sort_by !== 'newest' && (
                            <span className="filter-tag">
                                Sort: {getSortLabel(filters.sort_by)}
                                <button onClick={() => {
                                    console.log("🔍 FILTERS: Removing sort filter");
                                    handleSortSelect('newest');
                                }} className="remove-filter">
                                    <i className="fas fa-times"></i>
                                </button>
                            </span>
                        )}
                        
                        {filters.status && (
                            <span className="filter-tag">
                                Status: {getStatusLabel(filters.status)}
                                <button onClick={() => {
                                    console.log("🔍 FILTERS: Removing status filter");
                                    handleStatusSelect('');
                                }} className="remove-filter">
                                    <i className="fas fa-times"></i>
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductFilters;