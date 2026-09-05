import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isAdmin, logout } from '../utils/auth';
import {
    IconDashboard,
    IconAccount,
    IconTransfer,
    IconTransactions,
    IconAdmin,
    IconBank,
} from './Icons';
import '../styles/layout.css';

const customerLinks = [
    { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
    { to: '/my-account', label: 'My Account', Icon: IconAccount },
    { to: '/transfer', label: 'Transfer Money', Icon: IconTransfer },
    { to: '/transactions', label: 'Transactions', Icon: IconTransactions },
];

function AppLayout({ children, title, subtitle }) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const adminUser = isAdmin();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        if (!menuOpen) return;

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    return (
        <div className="app-layout">
            <aside className={`app-sidebar ${menuOpen ? 'app-sidebar--open' : ''}`}>
                <div className="app-sidebar__brand">
                    <span className="app-sidebar__brand-icon">
                        <IconBank />
                    </span>
                    LedgerPay
                </div>

                <nav className="app-sidebar__nav">
                    {customerLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
                            }
                            onClick={closeMenu}
                        >
                            <link.Icon />
                            {link.label}
                        </NavLink>
                    ))}

                    {adminUser && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `app-sidebar__link app-sidebar__link--admin${
                                    isActive ? ' app-sidebar__link--active' : ''
                                }`
                            }
                            onClick={closeMenu}
                        >
                            <IconAdmin />
                            Admin Dashboard
                        </NavLink>
                    )}
                </nav>

                <button
                    type="button"
                    className="app-sidebar__logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            {menuOpen && (
                <button
                    type="button"
                    className="app-sidebar__overlay"
                    aria-label="Close navigation menu"
                    onClick={closeMenu}
                />
            )}

            <div className="app-layout__main">
                <header className="app-topbar">
                    <button
                        type="button"
                        className="app-topbar__menu"
                        aria-label="Open navigation menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(true)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    {(title || subtitle) && (
                        <div className="app-topbar__heading">
                            {title && <h1>{title}</h1>}
                            {subtitle && <p>{subtitle}</p>}
                        </div>
                    )}
                </header>

                <main className="app-content">
                    {(title || subtitle) && (
                        <div className="app-page-header">
                            {title && <h1>{title}</h1>}
                            {subtitle && <p>{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
