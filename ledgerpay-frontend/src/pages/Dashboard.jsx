import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();

    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState('');

    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState('');

    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionError, setTransactionError] = useState('');
    const [transactionSuccess, setTransactionSuccess] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setApiError('');

            const [accountResponse, transactionsResponse] =
                await Promise.all([
                    api.get('/api/account'),
                    api.get('/api/transactions')
                ]);

            setAccount(accountResponse.data);

            const transactionData = transactionsResponse.data;

            if (Array.isArray(transactionData)) {
                setTransactions(transactionData);
            } else if (
                transactionData &&
                Array.isArray(transactionData.transactions)
            ) {
                setTransactions(transactionData.transactions);
            } else {
                setTransactions([]);
            }

        } catch (error) {
            console.error('Dashboard error:', error);

            if (
                error.response &&
                error.response.status === 401
            ) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            setApiError(
                'Unable to load dashboard data. Please try again later.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const formatBalance = (balance) => {
        const numericBalance = Number(balance);

        if (Number.isNaN(numericBalance)) {
            return '₹0.00';
        }

        return `₹${numericBalance.toFixed(2)}`;
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
        const value =
            transaction.amount ??
            transaction.transactionAmount;

        if (value === undefined || value === null) {
            return '--';
        }

        return `₹${Number(value).toFixed(2)}`;
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

    const openTransactionModal = (type) => {
        setTransactionType(type);
        setAmount('');
        setTransactionError('');
        setTransactionSuccess('');
        setShowTransactionModal(true);
    };

    const closeTransactionModal = () => {
        if (isProcessing) {
            return;
        }

        setShowTransactionModal(false);
        setAmount('');
        setTransactionError('');
        setTransactionSuccess('');
    };

    const handleTransaction = async (e) => {
        e.preventDefault();

        setTransactionError('');
        setTransactionSuccess('');

        const numericAmount = Number(amount);

        if (!amount.trim()) {
            setTransactionError('Please enter an amount.');
            return;
        }

        if (numericAmount <= 0) {
            setTransactionError(
                'Amount must be greater than zero.'
            );
            return;
        }

        setIsProcessing(true);

        try {
            let response;

            if (transactionType === 'deposit') {
                response = await api.post(
                    '/api/account/deposit',
                    {
                        amount: numericAmount
                    }
                );
            } else {
                response = await api.post(
                    '/api/account/withdraw',
                    {
                        amount: numericAmount
                    }
                );
            }

            console.log(
                'Transaction response:',
                response.data
            );

            setTransactionSuccess(
                transactionType === 'deposit'
                    ? 'Money deposited successfully.'
                    : 'Money withdrawn successfully.'
            );

            await fetchDashboardData();

            setAmount('');

        } catch (error) {
            console.error(
                'Transaction error:',
                error
            );

            if (
                error.response &&
                error.response.status === 401
            ) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            setTransactionError(
                error.response?.data?.message ||
                'Transaction failed. Please try again.'
            );

        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="dashboard-page">

            {/* Sidebar */}
            <aside className="dashboard-sidebar">

                <div className="sidebar-logo">
                    LedgerPay
                </div>

                <nav className="sidebar-nav">

                    <a
                        href="#"
                        className="sidebar-nav-item active"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/dashboard');
                        }}
                    >
                        Dashboard
                    </a>

                    <a
                        href="#"
                        className="sidebar-nav-item"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/my-account');
                        }}
                    >
                        My Account
                    </a>

                    <a
                        href="#"
                        className="sidebar-nav-item"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/transfer');
                        }}
                    >
                        Transfer Money
                    </a>

                    <a
                        href="#"
                        className="sidebar-nav-item"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/transactions');
                        }}
                    >
                        Transactions
                    </a>

                </nav>

                <button
                    className="sidebar-logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </aside>

            {/* Main Content */}
            <main className="dashboard-main">

                <div className="dashboard-welcome">

                    <h1 className="dashboard-welcome-title">
                        Welcome to LedgerPay
                    </h1>

                    <p className="dashboard-welcome-subtitle">
                        Manage your account and transactions.
                    </p>

                </div>

                {isLoading && (
                    <div className="transactions-empty-state">
                        <p>Loading dashboard...</p>
                    </div>
                )}

                {!isLoading && apiError && (
                    <div className="transactions-empty-state">
                        <p>{apiError}</p>
                    </div>
                )}

                {!isLoading && !apiError && account && (

                    <>

                        {/* Account Summary */}
                        <section className="account-summary-card">

                            <div className="account-balance-section">

                                <span className="account-balance-label">
                                    Available Balance
                                </span>

                                <span className="account-balance-value">
                                    {formatBalance(account.balance)}
                                </span>

                            </div>

                            <div className="account-details-grid">

                                <div className="account-detail-item">

                                    <span className="account-detail-label">
                                        Account Number
                                    </span>

                                    <span className="account-detail-value">
                                        {account.accountNumber || '--'}
                                    </span>

                                </div>

                                <div className="account-detail-item">

                                    <span className="account-detail-label">
                                        UPI ID
                                    </span>

                                    <span className="account-detail-value">
                                        {account.upiId || '--'}
                                    </span>

                                </div>

                                <div className="account-detail-item">

                                    <span className="account-detail-label">
                                        Account Status
                                    </span>

                                    <span className="account-detail-value">
                                        {account.status || '--'}
                                    </span>

                                </div>

                            </div>

                        </section>

                        {/* Quick Actions */}
                        <section className="quick-actions-section">

                            <h2 className="section-heading">
                                Quick Actions
                            </h2>

                            <div className="quick-actions-grid">

                                <button
                                    className="quick-action-button"
                                    onClick={() =>
                                        openTransactionModal('deposit')
                                    }
                                >
                                    Deposit Money
                                </button>

                                <button
                                    className="quick-action-button"
                                    onClick={() =>
                                        openTransactionModal('withdraw')
                                    }
                                >
                                    Withdraw Money
                                </button>

                                <button
                                    className="quick-action-button"
                                    onClick={() =>
                                        navigate('/transfer')
                                    }
                                >
                                    Transfer Money
                                </button>

                            </div>

                        </section>

                        {/* Recent Transactions */}
                        <section className="recent-transactions-section">

                            <h2 className="section-heading">
                                Recent Transactions
                            </h2>

                            {transactions.length === 0 ? (

                                <div className="transactions-empty-state">
                                    <p>No recent transactions</p>
                                </div>

                            ) : (

                                <div className="transactions-table-wrapper">

                                    <table className="transactions-table">

                                        <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                        </thead>

                                        <tbody>

                                        {transactions.map(
                                            (transaction, index) => (

                                                <tr
                                                    key={
                                                        transaction.id ??
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        {getTransactionType(
                                                            transaction
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getTransactionAmount(
                                                            transaction
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getTransactionStatus(
                                                            transaction
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            getTransactionDate(
                                                                transaction
                                                            )
                                                        )}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </section>

                    </>

                )}

            </main>

            {/* Deposit / Withdraw Modal */}
            {showTransactionModal && (

                <div className="transaction-modal-overlay">

                    <div className="transaction-modal">

                        <div className="transaction-modal-header">

                            <h2>
                                {transactionType === 'deposit'
                                    ? 'Deposit Money'
                                    : 'Withdraw Money'}
                            </h2>

                            <button
                                className="transaction-modal-close"
                                onClick={closeTransactionModal}
                                disabled={isProcessing}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={handleTransaction}
                            className="transaction-modal-form"
                        >

                            <label htmlFor="transactionAmount">
                                Amount
                            </label>

                            <div className="transaction-amount-wrapper">

                                <span>₹</span>

                                <input
                                    id="transactionAmount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter amount"
                                    disabled={isProcessing}
                                />

                            </div>

                            {transactionError && (
                                <p className="transaction-modal-error">
                                    {transactionError}
                                </p>
                            )}

                            {transactionSuccess && (
                                <p className="transaction-modal-success">
                                    {transactionSuccess}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="transaction-modal-submit"
                                disabled={isProcessing}
                            >
                                {isProcessing
                                    ? 'Processing...'
                                    : transactionType === 'deposit'
                                        ? 'Deposit'
                                        : 'Withdraw'}
                            </button>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Dashboard;