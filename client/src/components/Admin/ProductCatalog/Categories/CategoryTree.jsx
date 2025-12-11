import React, { useState, useEffect } from 'react';
import { useCategoryContext } from '../../../../context/CategoryContext';
import './CategoryTree.css';

const CategoryTree = ({ onCategorySelect, onAddSubcategory }) => {
    const { 
        categories, 
        loading, 
        error, 
        fetchAllCategories
    } = useCategoryContext();
    
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    // Load categories only once
    useEffect(() => {
        fetchAllCategories();
    }, []);

    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const renderCategoryNode = (category, level = 0) => {
        const isExpanded = expandedCategories.has(category.category_id);

        return (
            <div key={category.category_id} className="tree-node">
                <div 
                    className={`tree-item ${isExpanded ? 'expanded' : ''}`}
                    style={{ paddingLeft: `${level * 20 + 20}px` }}
                >
                    <div className="item-content">
                        <div className="item-info" onClick={() => onCategorySelect(category.category_id)}>
                            <div className="item-icon">
                                <i className="fas fa-folder"></i>
                            </div>
                            <div className="item-details">
                                <h4 className="item-name">{category.category_name}</h4>
                                {category.description && (
                                    <p className="item-description">{category.description}</p>
                                )}
                                <div className="item-meta">
                                    <span className="meta-item">
                                        <i className="fas fa-box"></i>
                                        ID: {category.category_id}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="item-actions">
                            <button 
                                className="tree-action-btn add-sub"
                                onClick={() => onAddSubcategory(category.category_id)}
                                title="Add Subcategory"
                            >
                                <i className="fas fa-plus-circle"></i>
                            </button>
                            <button 
                                className="tree-action-btn edit"
                                onClick={() => onCategorySelect(category.category_id)}
                                title="Edit Category"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="category-tree">
            <div className="tree-header">
                <h3 className="tree-title">
                    <i className="fas fa-sitemap"></i>
                    Category Hierarchy
                </h3>
                <div className="tree-stats">
                    <span className="stat">
                        <i className="fas fa-folder"></i>
                        {categories.length} Categories
                    </span>
                </div>
            </div>

            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading category tree...</p>
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
                <div className="tree-container">
                    {categories.length > 0 ? (
                        <div className="tree-content">
                            {categories.map(category => renderCategoryNode(category))}
                        </div>
                    ) : (
                        <div className="empty-tree">
                            <div className="empty-icon">
                                <i className="fas fa-tree"></i>
                            </div>
                            <h3>No Categories Found</h3>
                            <p>Create your first category to start building your hierarchy.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="tree-legend">
                <div className="legend-item">
                    <i className="fas fa-folder legend-icon category"></i>
                    <span>Category</span>
                </div>
                <div className="legend-item">
                    <div className="legend-status expanded"></div>
                    <span>Expanded</span>
                </div>
                <div className="legend-item">
                    <div className="legend-status collapsed"></div>
                    <span>Collapsed</span>
                </div>
            </div>
        </div>
    );
};

export default CategoryTree;