import React, { useState, useEffect } from 'react';
import { useCategoryContext } from '../../../../context/CategoryContext';
import SubcategoryCard from './SubcategoryCard';
import './CategoryList.css';

const CategoryList = ({ onEdit, onAddSubcategory }) => {
    const { 
        categories, 
        loading, 
        error, 
        fetchAllCategories,
        getSubcategories,
        fetchSubcategoriesForCategory,
        deleteCategory 
    } = useCategoryContext();
    
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchAllCategories();
    }, []);

    const toggleCategoryExpansion = async (categoryId) => {
        if (expandedCategory === categoryId) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categoryId);
            // Load subcategories if not already loaded
            const subs = getSubcategories(categoryId);
            if (!subs || subs.length === 0) {
                await fetchSubcategoriesForCategory(categoryId);
            }
        }
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (window.confirm(`Are you sure you want to delete "${categoryName}"? This will also delete all subcategories.`)) {
            await deleteCategory(categoryId);
            if (expandedCategory === categoryId) {
                setExpandedCategory(null);
            }
        }
    };

    const handleDeleteSubcategory = async (subcategoryId, subcategoryName) => {
        if (window.confirm(`Are you sure you want to delete "${subcategoryName}"?`)) {
            // This would be implemented in context
            alert('Delete subcategory functionality needs to be implemented');
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const filteredCategories = categories.filter(category => 
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedCategories = [...filteredCategories].sort((a, b) => {
        if (sortBy === 'name') {
            return sortOrder === 'asc' 
                ? a.category_name.localeCompare(b.category_name)
                : b.category_name.localeCompare(a.category_name);
        } else {
            return sortOrder === 'asc' 
                ? a.category_id - b.category_id
                : b.category_id - a.category_id;
        }
    });

    return (
        <div className="category-list">
            <div className="list-header">
                <div className="search-controls">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button 
                                className="clear-search"
                                onClick={() => setSearchTerm('')}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                    
                    <div className="sort-controls">
                        <span className="sort-label">Sort by:</span>
                        <div className="sort-buttons">
                            <button 
                                className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                                onClick={() => handleSort('name')}
                            >
                                Name {sortBy === 'name' && (
                                    <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                                )}
                            </button>
                            <button 
                                className={`sort-btn ${sortBy === 'id' ? 'active' : ''}`}
                                onClick={() => handleSort('id')}
                            >
                                ID {sortBy === 'id' && (
                                    <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="stats-summary">
                    <div className="stat-item">
                        <i className="fas fa-folder"></i>
                        <span className="stat-value">{categories.length}</span>
                        <span className="stat-label">Categories</span>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading categories...</p>
                </div>
            )}

            {error && (
                <div className="error-state">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                    <button onClick={fetchAllCategories} className="retry-btn">
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <>
                    {sortedCategories.length > 0 ? (
                        <div className="categories-container">
                            {sortedCategories.map((category) => {
                                const isExpanded = expandedCategory === category.category_id;
                                const subcategories = getSubcategories(category.category_id) || [];
                                
                                return (
                                    <div key={category.category_id} className="category-card">
                                        <div className="category-header">
                                            <div className="category-info">
                                                <button 
                                                    className="expand-btn"
                                                    onClick={() => toggleCategoryExpansion(category.category_id)}
                                                >
                                                    <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                                                </button>
                                                <div className="category-details">
                                                    <h3 className="category-name">
                                                        {category.category_name}
                                                        <span className="category-id">ID: {category.category_id}</span>
                                                    </h3>
                                                    {category.description && (
                                                        <p className="category-description">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="category-actions">
                                                <button 
                                                    className="action-btn edit"
                                                    onClick={() => onEdit(category.category_id)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                    Edit
                                                </button>
                                                <button 
                                                    className="action-btn add-sub"
                                                    onClick={() => onAddSubcategory(category.category_id)}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                    Add Subcategory
                                                </button>
                                                <button 
                                                    className="action-btn delete"
                                                    onClick={() => handleDeleteCategory(category.category_id, category.category_name)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {isExpanded && (
                                            <div className="subcategories-section">
                                                <div className="subcategories-header">
                                                    <h4>
                                                        <i className="fas fa-sitemap"></i>
                                                        Subcategories ({subcategories.length})
                                                    </h4>
                                                    <button 
                                                        className="add-sub-btn"
                                                        onClick={() => onAddSubcategory(category.category_id)}
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                        Add New
                                                    </button>
                                                </div>
                                                
                                                {subcategories.length > 0 ? (
                                                    <div className="subcategories-grid">
                                                        {subcategories.map(subcategory => (
                                                            <SubcategoryCard 
                                                                key={subcategory.sub_category_id}
                                                                subcategory={subcategory}
                                                                onEdit={() => onAddSubcategory(category.category_id, subcategory.sub_category_id)}
                                                                onDelete={() => handleDeleteSubcategory(subcategory.sub_category_id, subcategory.sub_category_name)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="no-subcategories">
                                                        <i className="fas fa-folder-open"></i>
                                                        <p>No subcategories found. Add your first subcategory.</p>
                                                        <button 
                                                            className="add-first-btn"
                                                            onClick={() => onAddSubcategory(category.category_id)}
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                            Add First Subcategory
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-folder-open"></i>
                            </div>
                            <h3>No Categories Found</h3>
                            <p>{searchTerm ? 'No categories match your search.' : 'Start by creating your first category.'}</p>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryList;