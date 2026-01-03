import React, { useState, useEffect } from "react";
import { useVariant } from "../../../context/VariantContext";
import { useMedia } from "../../../context/MediaContext";
import VariantList from "../../../components/Admin/ProductCatalog/Variants/VariantList";
import VariantForm from "../../../components/Admin/ProductCatalog/Variants/VariantForm";
import VariantDetail from "../../../components/Admin/ProductCatalog/Variants/VariantDetail";
import VariantMediaSection from "../../../components/Admin/ProductCatalog/Variants/VariantMediaSection";
import { 
  X,
  FileText,
  Image as ImageIcon,
  ChevronLeft
} from "lucide-react";
import "./Variants.css";

const VariantsPage = () => {
  const {
    variants,
    selectedVariant,
    pagination,
    loading,
    error,
    fetchVariants,
    fetchVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    updateStock,
    updatePrice,
    setDiscount,
    updateStatus,
    setDefault,
    clearError,
    clearSelectedVariant,
  } = useVariant();

  const { selectVariant } = useMedia();

  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit', 'detail'
  const [currentVariant, setCurrentVariant] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("details"); // 'details', 'media'

  // Load variants on mount
  useEffect(() => {
    fetchVariants();
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    fetchVariants(page, pagination.perPage, filters.productId);
  };

  // Handle filter
  const handleFilter = (filterValues) => {
    setFilters(filterValues);
    fetchVariants(1, pagination.perPage, filterValues.productId);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    // Implement search logic based on your backend
    // For now, we'll just refetch with current filters
    fetchVariants(1, pagination.perPage, filters.productId);
  };

  // Create variant
  const handleCreateVariant = async (variantData) => {
    const result = await createVariant(variantData);
    if (result.success) {
      setViewMode("list");
      fetchVariants();
    }
  };

  // Update variant
  const handleUpdateVariant = async (variantData) => {
    const result = await updateVariant(currentVariant.variant_id, variantData);
    if (result.success) {
      setViewMode("list");
      fetchVariants();
    }
  };

  // Delete variant
  const handleDeleteVariant = async (variantId) => {
    const result = await deleteVariant(variantId);
    if (result.success) {
      fetchVariants();
    }
  };

  // View variant details
  const handleViewDetail = async (variant) => {
    const result = await fetchVariantById(variant.variant_id);
    if (result.success) {
      setCurrentVariant(variant);
      setViewMode("detail");
      selectVariant(variant.variant_id);
    }
  };

  // Edit variant
  const handleEditVariant = (variant) => {
    setCurrentVariant(variant);
    setViewMode("edit");
  };

  // Create new variant
  const handleCreateNew = () => {
    setCurrentVariant(null);
    setViewMode("create");
  };

  // Close detail view
  const handleCloseDetail = () => {
    setViewMode("list");
    clearSelectedVariant();
  };

  return (
    <div className="variants-container">
      {/* Header */}
      <div className="variants-header">
        <div className="variants-header-inner">
          <div>
            <h1 className="variants-title">Product Variants</h1>
            <p className="variants-subtitle">
              Manage product variants, pricing, stock, and media
            </p>
          </div>
          {viewMode !== "list" && (
            <button
              onClick={handleCloseDetail}
              className="variants-btn variants-btn-ghost"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="variants-content">
          <div className="variants-alert variants-alert-error">
            <div className="variants-alert-content variants-flex variants-justify-between variants-items-center">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="variants-alert-close"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="variants-content">
        {viewMode === "list" ? (
          // List View
          <VariantList
            variants={variants}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onFilter={handleFilter}
            onViewDetail={handleViewDetail}
            onEdit={handleEditVariant}
            onDelete={handleDeleteVariant}
            onUpdateStock={updateStock}
            onUpdatePrice={updatePrice}
            onSetDiscount={setDiscount}
            onUpdateStatus={updateStatus}
            onSetDefault={setDefault}
            onCreateNew={handleCreateNew}
          />
        ) : (
          // Detail/Create/Edit View
          <div className="variants-space-y-6">
            {/* Back Button */}
            <button
              onClick={handleCloseDetail}
              className="variants-flex variants-items-center variants-text-blue-600 hover:variants-text-blue-800 variants-transition-colors"
            >
              <ChevronLeft className="w-5 h-5 variants-mr-2" />
              Back to Variants List
            </button>

            {/* Content */}
            <div className="variants-card">
              {/* Tabs for Detail View */}
              {viewMode === "detail" && (
                <div className="variants-border-b">
                  <nav className="variants-tabs">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`variants-tab ${
                        activeTab === "details"
                          ? "variants-tab-active"
                          : ""
                      }`}
                    >
                      <FileText className="w-4 h-4 variants-mr-2" />
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab("media")}
                      className={`variants-tab ${
                        activeTab === "media"
                          ? "variants-tab-active"
                          : ""
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 variants-mr-2" />
                      Media
                    </button>
                  </nav>
                </div>
              )}

              {/* Tab Content */}
              <div className="variants-p-6">
                {viewMode === "create" && (
                  <div>
                    <h2 className="variants-text-2xl variants-font-bold variants-text-gray-900 variants-mb-6">Create New Variant</h2>
                    <VariantForm
                      onSubmit={handleCreateVariant}
                      onCancel={handleCloseDetail}
                      loading={loading}
                    />
                  </div>
                )}

                {viewMode === "edit" && currentVariant && (
                  <div>
                    <h2 className="variants-text-2xl variants-font-bold variants-text-gray-900 variants-mb-6">Edit Variant</h2>
                    <VariantForm
                      variant={currentVariant}
                      onSubmit={handleUpdateVariant}
                      onCancel={handleCloseDetail}
                      loading={loading}
                    />
                  </div>
                )}

                {viewMode === "detail" && (
                  <>
                    {activeTab === "details" && (
                      <VariantDetail variant={selectedVariant} />
                    )}
                    {activeTab === "media" && currentVariant && (
                      <VariantMediaSection variantId={currentVariant.variant_id} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && viewMode === "list" && (
          <div className="variants-loading-overlay">
            <div className="variants-loading-content">
              <div className="variants-loading-spinner" />
              <p className="variants-loading-text">Loading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="variants-footer">
        <div className="variants-footer-inner">
          <div className="variants-stats-grid">
            <div className="variants-stat-card">
              <div className="variants-stat-value">{pagination.total}</div>
              <div className="variants-stat-label">Total Variants</div>
            </div>
            <div className="variants-stat-card">
              <div className="variants-stat-value">
                {variants.filter(v => v.status === "ACTIVE").length}
              </div>
              <div className="variants-stat-label">Active Variants</div>
            </div>
            <div className="variants-stat-card">
              <div className="variants-stat-value">
                {variants.filter(v => v.stock_quantity === 0).length}
              </div>
              <div className="variants-stat-label">Out of Stock</div>
            </div>
            <div className="variants-stat-card">
              <div className="variants-stat-value">
                {variants.filter(v => v.discount_type !== "NONE").length}
              </div>
              <div className="variants-stat-label">On Discount</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantsPage;