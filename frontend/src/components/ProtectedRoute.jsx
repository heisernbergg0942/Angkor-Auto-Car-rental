import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps a route that requires authentication.
 *
 * Props:
 *   roles?: string[]  — if provided, user must have one of these roles
 *   redirectTo?: string — where to redirect if unauthenticated (default: /login)
 */
export default function ProtectedRoute({ children, roles, redirectTo = '/login' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Wrong role — redirect admin to /admin, customer to /
    const fallback = user.role === 'admin' || user.role === 'staff' ? '/admin' : '/';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
