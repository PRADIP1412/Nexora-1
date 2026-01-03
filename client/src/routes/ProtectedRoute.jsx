// src/routes/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false, deliveryOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const userRoles = user?.roles || [];
  console.log('🛡️ ProtectedRoute Check - User roles:', userRoles);
  
  // Admin only routes
  if (adminOnly && !userRoles.includes("admin")) {
    console.log('❌ Admin access denied, redirecting to not-authorized');
    return <Navigate to="/not-authorized" replace />;
  }

  // Delivery only routes - FIXED: Use "delivery" (lowercase)
  if (deliveryOnly && !userRoles.includes("delivery")) {
    console.log('❌ Delivery access denied, redirecting to not-authorized');
    return <Navigate to="/not-authorized" replace />;
  }

  console.log('✅ Access granted');
  return children;
};

export default ProtectedRoute;