import { useAuth } from "../../contexts/authContext";
import React, { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface PrivateRouteProps {
  element: JSX.Element;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  element,
  allowedRoles,
}) => {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role) {
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return element;
};

export default PrivateRoute;