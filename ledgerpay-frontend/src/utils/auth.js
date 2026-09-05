export function decodeJwtPayload(token) {
    try {
        const payloadPart = token.split('.')[1];
        if (!payloadPart) return null;

        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

export function hasAdminRole(payload) {
    if (!payload) return false;

    if (typeof payload.role === 'string') {
        return payload.role === 'ADMIN';
    }

    if (Array.isArray(payload.roles)) {
        return payload.roles.includes('ADMIN');
    }

    if (typeof payload.roles === 'string') {
        return payload.roles === 'ADMIN';
    }

    return false;
}

export function isAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return hasAdminRole(decodeJwtPayload(token));
}

export function getStoredUser() {
    try {
        const raw = localStorage.getItem('user');
        if (raw) {
            return JSON.parse(raw);
        }
    } catch {
        // fall through to JWT subject
    }

    const token = localStorage.getItem('token');
    const payload = token ? decodeJwtPayload(token) : null;
    if (payload?.sub) {
        return { email: payload.sub };
    }

    return null;
}

export function storeUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function handleUnauthorized(navigate) {
    logout();
    navigate('/login');
}
