function IconBase({ children, className = '' }) {
    return (
        <svg
            className={`icon ${className}`.trim()}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export function IconDashboard({ className }) {
    return (
        <IconBase className={className}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </IconBase>
    );
}

export function IconAccount({ className }) {
    return (
        <IconBase className={className}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
        </IconBase>
    );
}

export function IconTransfer({ className }) {
    return (
        <IconBase className={className}>
            <path d="M7 7h10l-3-3" />
            <path d="M17 17H7l3 3" />
        </IconBase>
    );
}

export function IconTransactions({ className }) {
    return (
        <IconBase className={className}>
            <path d="M8 6h13" />
            <path d="M8 12h13" />
            <path d="M8 18h13" />
            <path d="M3 6h.01" />
            <path d="M3 12h.01" />
            <path d="M3 18h.01" />
        </IconBase>
    );
}

export function IconAdmin({ className }) {
    return (
        <IconBase className={className}>
            <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
        </IconBase>
    );
}

export function IconDeposit({ className }) {
    return (
        <IconBase className={className}>
            <path d="M12 3v14" />
            <path d="M5 10l7 7 7-7" />
        </IconBase>
    );
}

export function IconWithdraw({ className }) {
    return (
        <IconBase className={className}>
            <path d="M12 21V7" />
            <path d="M5 14l7-7 7 7" />
        </IconBase>
    );
}

export function IconWallet({ className }) {
    return (
        <IconBase className={className}>
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
        </IconBase>
    );
}

export function IconBank({ className }) {
    return (
        <IconBase className={className}>
            <path d="M3 10h18" />
            <path d="M5 10V18" />
            <path d="M9 10V18" />
            <path d="M15 10V18" />
            <path d="M19 10V18" />
            <path d="M2 18h20" />
            <path d="M12 3L2 10h20L12 3z" />
        </IconBase>
    );
}

export function IconUsers({ className }) {
    return (
        <IconBase className={className}>
            <circle cx="9" cy="8" r="3" />
            <path d="M2 20c0-3 3-5 7-5" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M14 20c0-2.5 2-4 5-4" />
        </IconBase>
    );
}

export function IconActivity({ className }) {
    return (
        <IconBase className={className}>
            <path d="M4 19h16" />
            <path d="M7 15l3-4 3 3 4-6" />
        </IconBase>
    );
}

export function IconReceipt({ className }) {
    return (
        <IconBase className={className}>
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
            <path d="M9 7h6" />
            <path d="M9 11h6" />
        </IconBase>
    );
}

export function IconLock({ className }) {
    return (
        <IconBase className={className}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </IconBase>
    );
}

export function IconInbox({ className }) {
    return (
        <IconBase className={className}>
            <path d="M22 12h-6l-2 3H10l-2-3H2" />
            <path d="M5 4h14l3 8v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l3-8z" />
        </IconBase>
    );
}
