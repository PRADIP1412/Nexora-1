import React from "react";
import VariantStatusBadge from "./VariantStatusBadge";
import { 
  Package, 
  DollarSign, 
  Tag, 
  Star,
  Image as ImageIcon,
  Video,
  Calendar 
} from "lucide-react";
import './VariantDetail.css';

const VariantDetail = ({ variant }) => {
  if (!variant) {
    return (
      <div className="vd-text-center vd-py-12">
        <p className="vd-text-gray-500">Select a variant to view details</p>
      </div>
    );
  }

  return (
    <div className="vd-space-y-6">
      {/* Header */}
      <div className="vd-border-b vd-pb-4">
        <div className="vd-flex vd-justify-between vd-items-start">
          <div>
            <h2 className="vd-text-2xl vd-font-bold vd-text-gray-900">
              {variant.variant_name || `Variant #${variant.variant_id}`}
            </h2>
            <p className="vd-text-gray-600">Product: {variant.product_name}</p>
          </div>
          <div className="vd-flex vd-items-center vd-space-x-2">
            {variant.is_default && (
              <span className="vd-badge-default">
                <Star className="vd-icon-sm vd-mr-1" />
                Default
              </span>
            )}
            <VariantStatusBadge status={variant.status} />
          </div>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="vd-grid vd-grid-cols-1 vd-md-grid-cols-2 vd-gap-6">
        {/* Price Information */}
        <div className="vd-card">
          <h3 className="vd-card-title vd-flex vd-items-center">
            <DollarSign className="vd-icon-md vd-mr-2 vd-text-blue-600" />
            Pricing Information
          </h3>
          <div className="vd-space-y-3">
            <div className="vd-flex vd-justify-between">
              <span className="vd-text-gray-600">Base Price</span>
              <span className="vd-font-medium">${variant.price.toFixed(2)}</span>
            </div>
            {variant.discount_type !== "NONE" && (
              <>
                <div className="vd-flex vd-justify-between">
                  <span className="vd-text-gray-600">Discount</span>
                  <span className="vd-font-medium vd-text-green-600">
                    {variant.discount_type === "PERCENT" 
                      ? `${variant.discount_value}%`
                      : `$${variant.discount_value}`
                    }
                  </span>
                </div>
                <div className="vd-flex vd-justify-between vd-border-t vd-pt-3">
                  <span className="vd-text-gray-900 vd-font-medium">Final Price</span>
                  <span className="vd-text-xl vd-font-bold vd-text-blue-600">
                    ${variant.final_price.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stock Information */}
        <div className="vd-card">
          <h3 className="vd-card-title vd-flex vd-items-center">
            <Package className="vd-icon-md vd-mr-2 vd-text-green-600" />
            Stock Information
          </h3>
          <div className="vd-space-y-3">
            <div className="vd-flex vd-justify-between">
              <span className="vd-text-gray-600">Current Stock</span>
              <span className={`vd-font-medium ${
                variant.stock_quantity === 0 ? "vd-text-red-600" : "vd-text-green-600"
              }`}>
                {variant.stock_quantity} units
              </span>
            </div>
            <div className="vd-flex vd-justify-between">
              <span className="vd-text-gray-600">Status</span>
              <VariantStatusBadge status={variant.status} />
            </div>
          </div>
        </div>

        {/* Media Stats */}
        <div className="vd-card">
          <h3 className="vd-card-title vd-flex vd-items-center">
            <ImageIcon className="vd-icon-md vd-mr-2 vd-text-purple-600" />
            Media
          </h3>
          <div className="vd-space-y-3">
            <div className="vd-flex vd-justify-between">
              <span className="vd-text-gray-600 vd-flex vd-items-center">
                <ImageIcon className="vd-icon-sm vd-mr-1" />
                Images
              </span>
              <span className="vd-font-medium">
                {variant.images?.length || 0} images
              </span>
            </div>
            <div className="vd-flex vd-justify-between">
              <span className="vd-text-gray-600 vd-flex vd-items-center">
                <Video className="vd-icon-sm vd-mr-1" />
                Videos
              </span>
              <span className="vd-font-medium">
                {variant.videos?.length || 0} videos
              </span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        {variant.attributes && variant.attributes.length > 0 && (
          <div className="vd-card">
            <h3 className="vd-card-title">Attributes</h3>
            <div className="vd-space-y-2">
              {variant.attributes.map((attr, index) => (
                <div key={index} className="vd-flex vd-justify-between">
                  <span className="vd-text-gray-600">{attr.attribute_name}</span>
                  <span className="vd-font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Images Preview */}
      {variant.images && variant.images.length > 0 && (
        <div className="vd-card">
          <h3 className="vd-card-title">Images Preview</h3>
          <div className="vd-grid vd-grid-cols-4 vd-gap-4">
            {variant.images.slice(0, 4).map((image, index) => (
              <div key={index} className="vd-relative">
                <img
                  src={image.url}
                  alt={`Variant image ${index + 1}`}
                  className="vd-w-full vd-h-32 vd-object-cover vd-rounded"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300?text=Image";
                  }}
                />
                {image.is_default && (
                  <span className="vd-absolute vd-top-1 vd-left-1 vd-px-2 vd-py-1 vd-bg-yellow-500 vd-text-white vd-text-xs vd-rounded">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="vd-bg-gray-50 vd-rounded-lg vd-p-4">
        <h4 className="vd-text-sm vd-font-medium vd-text-gray-700 vd-mb-2 vd-flex vd-items-center">
          <Calendar className="vd-icon-sm vd-mr-2" />
          Timestamps
        </h4>
        <div className="vd-grid vd-grid-cols-2 vd-gap-4 vd-text-sm">
          <div>
            <span className="vd-text-gray-600">Created:</span>
            <span className="vd-ml-2">
              {new Date(variant.created_at).toLocaleDateString()}
            </span>
          </div>
          {variant.updated_at && (
            <div>
              <span className="vd-text-gray-600">Last Updated:</span>
              <span className="vd-ml-2">
                {new Date(variant.updated_at).toLocaleDateString()}
            </span>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantDetail;