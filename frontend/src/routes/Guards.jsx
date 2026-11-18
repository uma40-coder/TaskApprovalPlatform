import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Requires authentication
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

// Admin only
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

// Approved users only
export const ApprovedRoute = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (user?.status === 'pending') return <Navigate to="/pending" replace />;
  if (user?.status === 'rejected') return <Navigate to="/rejected" replace />;
  return <Outlet />;
};

// Guest only (no auth)
export const GuestRoute = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  if (!isAuthenticated) return <Outlet />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (user?.status === 'approved') return <Navigate to="/dashboard" replace />;
  if (user?.status === 'pending') return <Navigate to="/pending" replace />;
  if (user?.status === 'rejected') return <Navigate to="/rejected" replace />;
  return <Navigate to="/dashboard" replace />;
};
