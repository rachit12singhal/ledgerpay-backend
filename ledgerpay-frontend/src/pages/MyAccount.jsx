import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import { getStoredUser, handleUnauthorized } from '../utils/auth';
import { formatBalance, formatDate, getApiErrorMessage } from '../utils/format';

function MyAccount() {
    const navigate = useNavigate();
    const user = getStoredUser();

    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await api.get('/api/account');
                setAccount(response.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    handleUnauthorized(navigate);
                    return;
                }
                setError(getApiErrorMessage(err, 'Unable to load account details. Please try again later.'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccount();
    }, [navigate]);

    return (
        <AppLayout title="My Account" subtitle="View your account information">
            {isLoading && (
                <div className="loading-state">
                    <p>Loading account details...</p>
                </div>
            )}

            {!isLoading && error && <div className="alert alert--error">{error}</div>}

            {!isLoading && !error && account && (
                <div className="account-sections">
                    {account.status === 'FROZEN' && (
                        <div className="alert alert--warning">
                            Your account is frozen. Contact support or an administrator for
                            assistance.
                        </div>
                    )}

                    <section className="card account-card">
                        <div className="account-card__hero">
                            <div className="account-card__hero-top">
                                <div className="balance-display">
                                    <div className="balance-display__label">Available Balance</div>
                                    <div className="balance-display__value">
                                        {formatBalance(account.balance)}
                                    </div>
                                </div>
                                <StatusBadge status={account.status} onDark />
                            </div>
                        </div>

                        <div className="account-card__body">
                            <h3 className="section-title">Personal Information</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-item__label">Full Name</span>
                                    <span className="detail-item__value">{user?.fullName || '--'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-item__label">Email</span>
                                    <span className="detail-item__value">{user?.email || '--'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-item__label">Member Since</span>
                                    <span className="detail-item__value">
                                        {formatDate(user?.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="card">
                        <h2 className="card__title">Account Details</h2>
                        <div className="detail-grid">
                            <div className="detail-item detail-item--highlight">
                                <span className="detail-item__label">Account Number</span>
                                <span className="detail-item__value font-mono">
                                    {account.accountNumber || '--'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-item__label">UPI ID</span>
                                <span className="detail-item__value">{account.upiId || '--'}</span>
                            </div>
                            <div className="detail-item detail-item--highlight">
                                <span className="detail-item__label">Account Status</span>
                                <span className="detail-item__value">
                                    <StatusBadge status={account.status} />
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </AppLayout>
    );
}

export default MyAccount;
