const VariantStatusBadge = ({ 
  status, 
  size = "default", 
  variant = "default",
  showIcon = false,
  pulse = false,
  count,
  className = ""
}) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      ACTIVE: { 
        color: "vsb-badge-active", 
        label: "Active",
        icon: "✓"
      },
      INACTIVE: { 
        color: "vsb-badge-inactive", 
        label: "Inactive",
        icon: "—"
      },
      OUT_OF_STOCK: { 
        color: "vsb-badge-out-of-stock", 
        label: "Out of Stock",
        icon: "✗"
      },
      DRAFT: {
        color: "vsb-badge-draft",
        label: "Draft",
        icon: "✎"
      },
      PENDING: {
        color: "vsb-badge-pending",
        label: "Pending",
        icon: "⏳"
      },
      FEATURED: {
        color: "vsb-badge-featured",
        label: "Featured",
        icon: "★"
      }
    };
    
    return statusMap[status] || { 
      color: "vsb-badge-inactive", 
      label: status,
      icon: "?"
    };
  };

  const config = getStatusConfig(status);
  
  const sizeClasses = {
    sm: "vsb-badge-sm",
    default: "",
    lg: "vsb-badge-lg",
    xl: "vsb-badge-xl"
  };
  
  const variantClasses = {
    default: "",
    outline: "vsb-badge-outline",
    solid: "vsb-badge-solid",
    gradient: "vsb-badge-gradient"
  };

  const badgeClasses = [
    "vsb-badge",
    config.color,
    sizeClasses[size],
    variantClasses[variant],
    pulse ? "vsb-badge-pulse" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <span className={badgeClasses}>
      {showIcon && (
        <span className="vsb-badge-icon">{config.icon}</span>
      )}
      <span className="vsb-badge-label">{config.label}</span>
      {count !== undefined && (
        <span className="vsb-badge-count">{count}</span>
      )}
    </span>
  );
};

// Add this wrapper component for badge groups
export const VariantStatusBadgeGroup = ({ 
  children, 
  direction = "row", 
  scrollable = false,
  className = "" 
}) => {
  const groupClasses = [
    "vsb-badge-group",
    direction === "column" ? "vsb-badge-group-stacked" : "",
    scrollable ? "vsb-badge-group-inline vsb-scrollable" : "",
    className
  ].filter(Boolean).join(" ");

  return <div className={groupClasses}>{children}</div>;
};

// Add utility components for different layouts
export const BadgeContainer = ({ children, className = "" }) => {
  return <div className={`variant-status-badge ${className}`}>{children}</div>;
};

export default VariantStatusBadge;