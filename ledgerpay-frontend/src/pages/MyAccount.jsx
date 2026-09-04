import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyAccount.css';

function MyAccount() {
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await api.get('/api/account');
                setAccount(response.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                setError('Unable to load account details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccount();
    }, [navigate]);

    const formatBalance = (balance) => {
        const numericBalance = Number(balance);
        if (Number.isNaN(numericBalance)) {
            return '₹0.00';
        }
        return `₹${numericBalance.toFixed(2)}`;
    };

    return (
        <div className="my-account-page">
            <div className="my-account-card">
                <div className="my-account-header">
                    <h1 className="my-account-title">My Account</h1>
                    <button
                        className="back-to-dashboard-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>

                {isLoading && (
                    <div className="my-account-status">
                        <p>Loading account details...</p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="my-account-status my-account-error">
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && account && (
                    <div className="my-account-details">
                        <div className="account-balance-section">
                            <span className="account-balance-label">Available Balance</span>
                            <span className="account-balance-value">
                {formatBalance(account.balance)}
              </span>
                        </div>

                        <div className="account-details-grid">
                            <div className="account-detail-item">
                                <span className="account-detail-label">Account Number</span>
                                <span className="account-detail-value">
                  {account.accountNumber || '--'}
                </span>
                            </div>

                            <div className="account-detail-item">
                                <span className="account-detail-label">UPI ID</span>
                                <span className="account-detail-value">
                  {account.upiId || '--'}
                </span>
                            </div>

                            <div className="account-detail-item">
                                <span className="account-detail-label">Account Status</span>
                                <span className="account-detail-value">
                  {account.status || '--'}
                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyAccount;