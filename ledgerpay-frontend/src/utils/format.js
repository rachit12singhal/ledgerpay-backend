export function formatBalance(balance) {
    const numericBalance = Number(balance);
    if (Number.isNaN(numericBalance)) {
        return '₹0.00';
    }
    return `₹${numericBalance.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function formatDate(dateValue) {
    if (!dateValue) return '--';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);

    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatTransactionType(type) {
    if (!type) return '--';
    return String(type).replace(/_/g, ' ');
}

export function getTransactionTypeVariant(type) {
    const normalized = String(type || '').toUpperCase();
    if (normalized.includes('DEPOSIT')) return 'deposit';
    if (normalized.includes('WITHDRAW')) return 'withdraw';
    if (normalized.includes('TRANSFER')) return 'transfer';
    return 'default';
}

export function getApiErrorMessage(error, fallback) {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.response?.status === 403) {
        return 'You do not have permission to perform this action.';
    }
    if (!error?.response) {
        return 'Unable to connect to the server. Please try again.';
    }
    return fallback;
}
