import React, { useState, useEffect } from "react";
import './VariantForm.css';

const VariantForm = ({ 
  variant = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    variant_name: "",
    product_id: "",
    price: "",
    stock_quantity: 0,
    discount_type: "NONE",
    discount_value: 0,
    status: "ACTIVE",
    is_default: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (variant) {
      setFormData({
        variant_name: variant.variant_name || "",
        product_id: variant.product_id || "",
        price: variant.price || "",
        stock_quantity: variant.stock_quantity || 0,
        discount_type: variant.discount_type || "NONE",
        discount_value: variant.discount_value || 0,
        status: variant.status || "ACTIVE",
        is_default: variant.is_default || false,
      });
    }
  }, [variant]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.product_id) {
      newErrors.product_id = "Product ID is required";
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    
    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Stock quantity cannot be negative";
    }
    
    if (formData.discount_type === "PERCENT" && 
        (formData.discount_value < 0 || formData.discount_value > 100)) {
      newErrors.discount_value = "Percentage discount must be between 0 and 100";
    }
    
    if (formData.discount_type === "FLAT" && formData.discount_value < 0) {
      newErrors.discount_value = "Flat discount cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        discount_value: parseFloat(formData.discount_value),
      };
      onSubmit(submitData);
    }
  };

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discountValue = parseFloat(formData.discount_value) || 0;
    
    if (formData.discount_type === "PERCENT") {
      return price * (1 - discountValue / 100);
    } else if (formData.discount_type === "FLAT") {
      return Math.max(price - discountValue, 0);
    }
    return price;
  };

  return (
    <form onSubmit={handleSubmit} className="vf-form">
      <div className="vf-grid">
        {/* Variant Name */}
        <div className="vf-form-group">
          <label className="vf-label">
            Variant Name <span className="vf-label-optional">(Optional)</span>
          </label>
          <div className="vf-input-container">
            <input
              type="text"
              name="variant_name"
              value={formData.variant_name}
              onChange={handleChange}
              className="vf-input"
              placeholder="e.g., Blue, Large, Premium"
            />
          </div>
        </div>

        {/* Product ID */}
        <div className="vf-form-group vf-form-group-required">
          <label className="vf-label">Product ID</label>
          <div className="vf-input-container">
            <input
              type="number"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className={`vf-input ${errors.product_id ? "vf-input-error" : ""}`}
              placeholder="Enter product ID"
              required
            />
            {errors.product_id && (
              <p className="vf-error">{errors.product_id}</p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="vf-form-group vf-form-group-required">
          <label className="vf-label">Price</label>
          <div className="vf-input-container">
            <span className="vf-input-prefix">$</span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`vf-input ${errors.price ? "vf-input-error" : ""}`}
              placeholder="0.00"
              required
            />
            {errors.price && (
              <p className="vf-error">{errors.price}</p>
            )}
          </div>
        </div>

        {/* Stock Quantity */}
        <div className="vf-form-group">
          <label className="vf-label">Stock Quantity</label>
          <div className="vf-input-container">
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              className={`vf-input ${errors.stock_quantity ? "vf-input-error" : ""}`}
            />
            {errors.stock_quantity && (
              <p className="vf-error">{errors.stock_quantity}</p>
            )}
          </div>
        </div>

        {/* Discount Type */}
        <div className="vf-form-group">
          <label className="vf-label">Discount Type</label>
          <div className="vf-input-container">
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="vf-input vf-select"
            >
              <option value="NONE">No Discount</option>
              <option value="PERCENT">Percentage Discount</option>
              <option value="FLAT">Flat Discount</option>
            </select>
          </div>
        </div>

        {/* Discount Value */}
        {formData.discount_type !== "NONE" && (
          <div className="vf-form-group">
            <label className="vf-label">
              Discount Value
              {formData.discount_type === "PERCENT" ? " (%)" : " ($)"}
            </label>
            <div className="vf-input-container">
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                min="0"
                step={formData.discount_type === "PERCENT" ? "1" : "0.01"}
                className={`vf-input ${errors.discount_value ? "vf-input-error" : ""}`}
              />
              {errors.discount_value && (
                <p className="vf-error">{errors.discount_value}</p>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="vf-form-group">
          <label className="vf-label">Status</label>
          <div className="vf-input-container">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="vf-input vf-select"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Is Default */}
        <div className="vf-checkbox-container">
          <input
            type="checkbox"
            name="is_default"
            id="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            className="vf-checkbox"
          />
          <label htmlFor="is_default" className="vf-checkbox-label">
            Set as default variant for this product
          </label>
        </div>
      </div>

      {/* Price Summary */}
      <div className="vf-price-summary">
        <h4 className="vf-price-summary-title">Price Summary</h4>
        <div className="vf-price-grid">
          <div className="vf-price-item">
            <div className="vf-price-label">Base Price</div>
            <div className="vf-price-value vf-price-value-base">
              {parseFloat(formData.price || 0).toFixed(2)}
            </div>
          </div>
          {formData.discount_type !== "NONE" && (
            <div className="vf-price-item">
              <div className="vf-price-label">Discount</div>
              <div className="vf-price-value vf-price-value-discount">
                {formData.discount_type === "PERCENT" 
                  ? `${formData.discount_value}%`
                  : `$${formData.discount_value}`
                }
              </div>
            </div>
          )}
          <div className="vf-price-item">
            <div className="vf-price-label">Final Price</div>
            <div className="vf-price-value vf-price-value-final">
              {calculateFinalPrice().toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="vf-form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="vf-btn vf-btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`vf-btn vf-btn-primary ${loading ? "vf-loading" : ""}`}
        >
          <span className="vf-btn-text">
            {variant ? "Update Variant" : "Create Variant"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default VariantForm;