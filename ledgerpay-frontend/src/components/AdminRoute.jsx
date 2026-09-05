import { Navigate } from 'react-router-dom';
import { decodeJwtPayload, hasAdminRole, logout } from '../utils/auth';

function AdminRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const payload = decodeJwtPayload(token);

    if (!payload) {
        logout();
        return <Navigate to="/login" replace />;
    }

    if (!hasAdminRole(payload)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default AdminRoute;
