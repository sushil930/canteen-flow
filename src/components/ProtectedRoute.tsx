import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: ('customer' | 'admin')[]; // Roles that are allowed to access this route
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, token, isLoading } = useAuth();
    const location = useLocation();

    // 1. Show loading state if auth status is being determined
    if (isLoading) {
        // You might want a more sophisticated loading spinner here
        return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
    }

    // 2. Redirect to login if no token/user exists
    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Check roles if specified
    if (allowedRoles) {
        const userRole = user.is_staff ? 'admin' : 'customer';
        if (!allowedRoles.includes(userRole)) {
            // User is logged in but doesn't have the right role
            // Redirect to an unauthorized page or home page
            // For simplicity, redirecting back to home/index
            console.warn(`User role '${userRole}' not allowed for path '${location.pathname}'. Allowed: ${allowedRoles.join(', ')}`);
            // Depending on user type, maybe redirect admins to admin dashboard and customers to home?
            return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/'} replace />;
        }
    }

    // 4. User is authenticated (and has the correct role if required), render the child routes
    return <Outlet />;
}; 