import React, { useState } from "react";
import { 
  Search, 
  Filter,
  ChevronLeft, 
  ChevronRight,
  Plus,
  Eye,
  MoreHorizontal
} from "lucide-react";
import VariantStatusBadge from "./VariantStatusBadge";
import VariantActions from "./VariantActions";
import './VariantList.css';

const VariantList = ({ 
  variants = [], 
  pagination,
  loading,
  onPageChange,
  onSearch,
  onFilter,
  onViewDetail,
  onEdit,
  onDelete,
  onUpdateStock,
  onUpdatePrice,
  onSetDiscount,
  onUpdateStatus,
  onSetDefault,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    productId: "",
    status: "",
    hasDiscount: "",
  });
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({ productId: "", status: "", hasDiscount: "" });
    setSearchTerm("");
    onFilter({});
    onSearch("");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading && variants.length === 0) {
    return (
      <div className="vl-loading">
        <div className="vl-text-center">
          <div className="vl-loading-spinner" />
          <p className="vl-loading-text">Loading variants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vl-container">
      {/* Header with Actions */}
      <div className="vl-header">
        <div className="vl-title-section">
          <h2 className="vl-title">Product Variants</h2>
          <p className="vl-subtitle">
            {pagination.total} variants total
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="vl-action-btn"
        >
          <Plus className="vl-action-btn-icon" />
          New Variant
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="vl-search-container">
        <form onSubmit={handleSearch} className="vl-search-form">
          {/* Search Input */}
          <div className="vl-search-input-container">
            <Search className="vl-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search variants by name, product, or ID..."
              className="vl-search-input"
            />
          </div>

          {/* Filters */}
          <div className="vl-filter-controls">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="vl-filter-select"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <select
              value={filters.hasDiscount}
              onChange={(e) => handleFilterChange("hasDiscount", e.target.value)}
              className="vl-filter-select"
            >
              <option value="">All Discounts</option>
              <option value="true">Has Discount</option>
              <option value="false">No Discount</option>
            </select>

            <input
              type="number"
              placeholder="Product ID"
              value={filters.productId}
              onChange={(e) => handleFilterChange("productId", e.target.value)}
              className="vl-filter-input"
            />

            <button
              type="button"
              onClick={clearFilters}
              className="vl-filter-btn vl-filter-btn-clear"
            >
              Clear
            </button>

            <button
              type="submit"
              className="vl-filter-btn vl-filter-btn-apply"
            >
              <Filter className="vl-filter-btn-icon" />
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Variants Table */}
      <div className="vl-table-container">
        <div className="vl-table-wrapper">
          <table className="vl-table">
            <thead>
              <tr>
                <th className="vl-text-sm vl-font-semibold vl-text-gray-700">
                  Variant
                </th>
                <th className="vl-text-sm vl-font-semibold vl-text-gray-700">
                  Product
                </th>
                <th className="vl-text-sm vl-font-semibold vl-text-gray-700">
                  Price
                </th>
                <th className="vl-text-sm vl-font-semibold vl-text-gray-700">
                  Stock
                </th>
                <th className="vl-text-sm vl-font-semibold vl-text-gray-700">
                  Status
                </th>
                <th className="vl-text-sm vl-font-semibold vl-text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="vl-empty-state">
                    <div className="vl-text-center">
                      <div className="vl-empty-icon">📦</div>
                      <p className="vl-empty-text">No variants found.</p>
                      {searchTerm && (
                        <p className="vl-empty-hint">Try a different search term.</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                variants.map((variant) => (
                  <tr key={variant.variant_id} className="hover:vl-bg-gray-50">
                    <td className="vl-p-4">
                      <div className="vl-cell-content">
                        <div className="vl-cell-title">
                          {variant.variant_name || `Variant #${variant.variant_id}`}
                          {variant.is_default && (
                            <span className="vl-cell-badge">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="vl-cell-subtitle">
                          ID: {variant.variant_id}
                        </div>
                      </div>
                    </td>
                    <td className="vl-p-4">
                      <div className="vl-cell-content">
                        <div className="vl-cell-title">
                          {variant.product_name || `Product #${variant.product_id}`}
                        </div>
                        <div className="vl-cell-subtitle">
                          PID: {variant.product_id}
                        </div>
                      </div>
                    </td>
                    <td className="vl-p-4">
                      <div className="vl-price-cell">
                        <div className="vl-price-value">
                          {formatPrice(variant.final_price)}
                        </div>
                        {variant.discount_type !== "NONE" && (
                          <div className="vl-price-discount">
                            {variant.discount_type === "PERCENT" 
                              ? `${variant.discount_value}% off`
                              : `$${variant.discount_value} off`
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="vl-p-4">
                      <div className={`vl-stock-cell ${
                        variant.stock_quantity === 0 ? "vl-stock-out-of-stock" : "vl-stock-in-stock"
                      }`}>
                        {variant.stock_quantity}
                      </div>
                    </td>
                    <td className="vl-p-4">
                      <VariantStatusBadge status={variant.status} />
                    </td>
                    <td className="vl-p-4">
                      <div className="vl-actions-cell">
                        <button
                          onClick={() => onViewDetail(variant)}
                          className="vl-action-icon-btn"
                          title="View Details"
                        >
                          <Eye className="vl-action-icon" />
                        </button>
                        
                        <VariantActions
                          variant={variant}
                          onEdit={() => onEdit(variant)}
                          onDelete={onDelete}
                          onUpdateStock={onUpdateStock}
                          onUpdatePrice={onUpdatePrice}
                          onSetDiscount={onSetDiscount}
                          onUpdateStatus={onUpdateStatus}
                          onSetDefault={onSetDefault}
                          loading={loading}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="vl-pagination">
            <div className="vl-pagination-info">
              Showing <span className="vl-pagination-highlight">
                {(pagination.page - 1) * pagination.perPage + 1}
              </span> to{" "}
              <span className="vl-pagination-highlight">
                {Math.min(pagination.page * pagination.perPage, pagination.total)}
              </span> of{" "}
              <span className="vl-pagination-highlight">{pagination.total}</span> variants
            </div>
            <div className="vl-pagination-controls">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="vl-pagination-btn"
              >
                <ChevronLeft className="vl-pagination-icon" />
              </button>
              
              <div className="vl-page-numbers">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                  const pageNum = Math.max(1, Math.min(
                    pagination.totalPages - 4,
                    pagination.page - 2
                  )) + idx;
                  
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`vl-page-btn ${
                        pagination.page === pageNum ? "vl-page-btn-active" : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="vl-pagination-btn"
              >
                <ChevronRight className="vl-pagination-icon" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantList;