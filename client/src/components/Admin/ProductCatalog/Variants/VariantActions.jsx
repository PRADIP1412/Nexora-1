import React, { useState } from "react";
import { 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Tag, 
  Power,
  Star,
  MoreVertical 
} from "lucide-react";
import './VariantActions.css';

const VariantActions = ({ 
  variant, 
  onEdit, 
  onDelete, 
  onUpdateStock, 
  onUpdatePrice, 
  onSetDiscount,
  onUpdateStatus,
  onSetDefault,
  loading = false 
}) => {
  const [showMore, setShowMore] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const [stockQuantity, setStockQuantity] = useState(variant?.stock_quantity || 0);
  const [price, setPrice] = useState(variant?.price || 0);
  const [discountType, setDiscountType] = useState(variant?.discount_type || "NONE");
  const [discountValue, setDiscountValue] = useState(variant?.discount_value || 0);
  const [status, setStatus] = useState(variant?.status || "ACTIVE");

  const handleUpdateStock = async () => {
    await onUpdateStock(variant.variant_id, parseInt(stockQuantity));
    setShowStockModal(false);
  };

  const handleUpdatePrice = async () => {
    await onUpdatePrice(variant.variant_id, parseFloat(price));
    setShowPriceModal(false);
  };

  const handleSetDiscount = async () => {
    await onSetDiscount(variant.variant_id, discountType, parseFloat(discountValue));
    setShowDiscountModal(false);
  };

  const handleUpdateStatus = async () => {
    await onUpdateStatus(variant.variant_id, status);
    setShowStatusModal(false);
  };

  const handleSetDefault = async () => {
    if (window.confirm(`Set this variant as default for product ${variant.product_id}?`)) {
      await onSetDefault(variant.product_id, variant.variant_id);
    }
  };

  return (
    <>
      <div className="variants-relative">
        <button
          onClick={() => setShowMore(!showMore)}
          className="variants-btn variants-btn-ghost"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMore && (
          <div className="variants-absolute variants-right-0 variants-top-full variants-mt-2 variants-w-48 variants-bg-white variants-rounded-lg variants-shadow-lg variants-border variants-z-50">
            <div className="variants-py-1">
              <button
                onClick={() => { setShowMore(false); onEdit(); }}
                className="variants-flex variants-items-center variants-w-full variants-px-4 variants-py-2 variants-text-sm variants-text-gray-700 hover:variants-bg-gray-100 variants-transition-colors"
              >
                <Edit className="w-4 h-4 variants-mr-2" />
                Edit Variant
              </button>

              <button
                onClick={() => { setShowMore(false); setShowStockModal(true); }}
                className="variants-flex variants-items-center variants-w-full variants-px-4 variants-py-2 variants-text-sm variants-text-gray-700 hover:variants-bg-gray-100 variants-transition-colors"
              >
                <Package className="w-4 h-4 variants-mr-2" />
                Update Stock
              </button>

              <button
                onClick={() => { setShowMore(false); setShowPriceModal(true); }}
                className="variants-flex variants-items-center variants-w-full variants-px-4 variants-py-2 variants-text-sm variants-text-gray-700 hover:variants-bg-gray-100 variants-transition-colors"
              >
                <DollarSign className="w-4 h-4 variants-mr-2" />
                Update Price
              </button>

              <button
                onClick={() => { setShowMore(false); setShowDiscountModal(true); }}
                className="variants-flex variants-items-center variants-w-full variants-px-4 variants-py-2 variants-text-sm variants-text-gray-700 hover:variants-bg-gray-100 variants-transition-colors"
              >
                <Tag className="w-4 h-4 variants-mr-2" />
                Set Discount
              </button>

              <button
                onClick={() => { setShowMore(false); setShowStatusModal(true); }}
                className="variants-flex variants-items-center variants-w-full variants-px-4 variants-py-2 variants-text-sm variants-text-gray-700 hover:variants-bg-gray-100 variants-transition-colors"
              >
                <Power className="w-4 h-4 variants-mr-2" />
                Update Status
              </button>

              {!variant?.is_default && (
                <button
                  onClick={() => { setShowMore(false); handleSetDefault(); }}
                  className="variants-flex variants-items-center variants-w-full variants-px-4 variants-py-2 variants-text-sm variants-text-gray-700 hover:variants-bg-gray-100 variants-transition-colors"
                >
                  <Star className="w-4 h-4 variants-mr-2" />
                  Set as Default
                </button>
              )}

              <button
                onClick={() => { 
                  setShowMore(false); 
                  if (window.confirm('Are you sure you want to delete this variant?')) {
                    onDelete(variant.variant_id);
                  }
                }}
                className="variants-flex variants-items-center variants-w-full variants-px-4 variants-py-2 variants-text-sm variants-text-red-600 hover:variants-bg-red-50 variants-transition-colors"
              >
                <Trash2 className="w-4 h-4 variants-mr-2" />
                Delete Variant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="variants-modal-overlay">
          <div className="variants-modal">
            <div className="variants-modal-header">
              <h3 className="variants-text-lg variants-font-medium">Update Stock Quantity</h3>
            </div>
            <div className="variants-modal-body">
              <div className="variants-form-group">
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="variants-form-input"
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>
            <div className="variants-modal-footer">
              <button
                onClick={() => setShowStockModal(false)}
                className="variants-btn variants-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={loading}
                className="variants-btn variants-btn-primary"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="variants-modal-overlay">
          <div className="variants-modal">
            <div className="variants-modal-header">
              <h3 className="variants-text-lg variants-font-medium">Update Price</h3>
            </div>
            <div className="variants-modal-body">
              <div className="variants-form-group">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="variants-form-input"
                  placeholder="Enter new price"
                />
              </div>
            </div>
            <div className="variants-modal-footer">
              <button
                onClick={() => setShowPriceModal(false)}
                className="variants-btn variants-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePrice}
                disabled={loading}
                className="variants-btn variants-btn-primary"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="variants-modal-overlay">
          <div className="variants-modal">
            <div className="variants-modal-header">
              <h3 className="variants-text-lg variants-font-medium">Set Discount</h3>
            </div>
            <div className="variants-modal-body">
              <div className="variants-form-group">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="variants-form-input variants-form-select"
                >
                  <option value="NONE">No Discount</option>
                  <option value="PERCENT">Percentage Discount</option>
                  <option value="FLAT">Flat Discount</option>
                </select>
              </div>

              {discountType !== "NONE" && (
                <div className="variants-form-group">
                  <input
                    type="number"
                    min="0"
                    step={discountType === "PERCENT" ? "1" : "0.01"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="variants-form-input"
                    placeholder={discountType === "PERCENT" ? "Discount percentage" : "Discount amount"}
                  />
                </div>
              )}
            </div>
            <div className="variants-modal-footer">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="variants-btn variants-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSetDiscount}
                disabled={loading}
                className="variants-btn variants-btn-primary"
              >
                {loading ? "Updating..." : "Update Discount"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="variants-modal-overlay">
          <div className="variants-modal">
            <div className="variants-modal-header">
              <h3 className="variants-text-lg variants-font-medium">Update Status</h3>
            </div>
            <div className="variants-modal-body">
              <div className="variants-form-group">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="variants-form-input variants-form-select"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="variants-modal-footer">
              <button
                onClick={() => setShowStatusModal(false)}
                className="variants-btn variants-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={loading}
                className="variants-btn variants-btn-primary"
              >
                {loading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VariantActions;