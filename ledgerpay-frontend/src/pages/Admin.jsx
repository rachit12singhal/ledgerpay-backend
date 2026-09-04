import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Admin.css';

function Admin() {
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState('');
    const [forbidden, setForbidden] = useState(false);

    const [processingAccountNumber, setProcessingAccountNumber] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [accountsResponse, transactionsResponse] =
                await Promise.all([
                    api.get('/api/admin/accounts'),
                    api.get('/api/admin/transactions'),
                ]);

            const accountsData = accountsResponse.data;
            const transactionsData = transactionsResponse.data;

            if (Array.isArray(accountsData)) {
                setAccounts(accountsData);
            } else if (accountsData && Array.isArray(accountsData.accounts)) {
                setAccounts(accountsData.accounts);
            } else {
                setAccounts([]);
            }

            if (Array.isArray(transactionsData)) {
                setTransactions(transactionsData);
            } else if (
                transactionsData &&
                Array.isArray(transactionsData.transactions)
            ) {
                setTransactions(transactionsData.transactions);
            } else {
                setTransactions([]);
            }

            setApiError('');
            setForbidden(false);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (error.response.status === 403) {
                    setForbidden(true);
                    return;
                }
            }

            setApiError('Unable to load admin data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFreeze = async (accountNumber) => {
        setProcessingAccountNumber(accountNumber);

        try {
            await api.post(`/api/account/${accountNumber}/freeze`);
            await fetchAdminData();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (error.response && error.response.status === 403) {
                setForbidden(true);
                return;
            }

            setApiError('Unable to freeze this account. Please try again.');
        } finally {
            setProcessingAccountNumber(null);
        }
    };

    const handleUnfreeze = async (accountNumber) => {
        setProcessingAccountNumber(accountNumber);

        try {
            await api.post(`/api/account/${accountNumber}/unfreeze`);
            await fetchAdminData();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (error.response && error.response.status === 403) {
                setForbidden(true);
                return;
            }

            setApiError('Unable to unfreeze this account. Please try again.');
        } finally {
            setProcessingAccountNumber(null);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return '--';
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleString();
    };

    const getTransactionType = (transaction) => {
        return (
            transaction.type ||
            transaction.transactionType ||
            transaction.transaction_type ||
            '--'
        );
    };

    const getTransactionAmount = (transaction) => {
        return (
            transaction.amount ??
            transaction.transactionAmount ??
            '--'
        );
    };

    const getTransactionStatus = (transaction) => {
        return transaction.status || 'SUCCESS';
    };

    const getTransactionDate = (transaction) => {
        return (
            transaction.createdAt ||
            transaction.timestamp ||
            transaction.created_at ||
            transaction.date
        );
    };

    if (isLoading) {
        return (
            <div className="admin-page">
                <div className="admin-status">
                    <p>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (forbidden) {
        return (
            <div className="admin-page">
                <div className="admin-status admin-error">
                    <p>You do not have permission to access the admin dashboard.</p>
                    <button
                        className="back-to-dashboard-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
                <button
                    className="back-to-dashboard-button"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>

            {apiError && (
                <div className="admin-status admin-error">
                    <p>{apiError}</p>
                </div>
            )}

            <section className="admin-section">
                <h2 className="admin-section-heading">All Accounts</h2>

                {accounts.length === 0 ? (
                    <div className="admin-empty-state">
                        <p>No accounts found</p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Account Number</th>
                                <th>UPI ID</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {accounts.map((account, index) => (
                                <tr key={account.id ?? account.accountNumber ?? index}>
                                    <td>{account.accountNumber ?? '--'}</td>
                                    <td>{account.upiId ?? '--'}</td>
                                    <td>₹{account.balance ?? '0.00'}</td>
                                    <td>{account.status ?? '--'}</td>
                                    <td>
                                        {account.status === 'ACTIVE' && (
                                            <button
                                                className="admin-action-button freeze-button"
                                                onClick={() => handleFreeze(account.accountNumber)}
                                                disabled={
                                                    processingAccountNumber === account.accountNumber
                                                }
                                            >
                                                {processingAccountNumber === account.accountNumber
                                                    ? 'Processing...'
                                                    : 'Freeze'}
                                            </button>
                                        )}

                                        {account.status === 'FROZEN' && (
                                            <button
                                                className="admin-action-button unfreeze-button"
                                                onClick={() => handleUnfreeze(account.accountNumber)}
                                                disabled={
                                                    processingAccountNumber === account.accountNumber
                                                }
                                            >
                                                {processingAccountNumber === account.accountNumber
                                                    ? 'Processing...'
                                                    : 'Unfreeze'}
                                            </button>
                                        )}

                                        {account.status !== 'ACTIVE' &&
                                            account.status !== 'FROZEN' && (
                                                <span className="admin-no-action">--</span>
                                            )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="admin-section">
                <h2 className="admin-section-heading">All Transactions</h2>

                {transactions.length === 0 ? (
                    <div className="admin-empty-state">
                        <p>No transactions found</p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                            </thead>

                            <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={transaction.id ?? index}>
                                    <td>{getTransactionType(transaction)}</td>
                                    <td>₹{getTransactionAmount(transaction)}</td>
                                    <td>{getTransactionStatus(transaction)}</td>
                                    <td>{formatDate(getTransactionDate(transaction))}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Admin;