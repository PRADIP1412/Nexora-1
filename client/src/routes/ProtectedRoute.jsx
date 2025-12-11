import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // 👇 Prevent redirect until auth is fully restored
  if (isLoading) return null; // or loading spinner

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !user?.roles?.includes("admin"))
    return <Navigate to="/not-authorized" replace />;

  return children;
};

export default ProtectedRoute;
