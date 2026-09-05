function StatusBadge({ status, onDark = false }) {
    if (!status) {
        return (
            <span className={`status-badge status-badge--neutral${onDark ? ' status-badge--on-dark' : ''}`}>
                --
            </span>
        );
    }

    const normalized = String(status).toUpperCase();
    let variant = 'neutral';

    if (normalized === 'ACTIVE' || normalized === 'SUCCESS') {
        variant = 'success';
    } else if (normalized === 'FROZEN' || normalized === 'FAILED') {
        variant = 'danger';
    } else if (normalized === 'CLOSED' || normalized === 'PENDING') {
        variant = 'warning';
    }

    return (
        <span className={`status-badge status-badge--${variant}${onDark ? ' status-badge--on-dark' : ''}`}>
            {normalized}
        </span>
    );
}

export default StatusBadge;
