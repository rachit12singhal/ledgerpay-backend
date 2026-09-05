import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import TransactionTable from '../components/TransactionTable';
import Modal from '../components/Modal';
import {
    IconDeposit,
    IconWithdraw,
    IconTransfer,
    IconTransactions,
    IconAccount,
} from '../components/Icons';
import { getStoredUser, handleUnauthorized } from '../utils/auth';
import { formatBalance, getApiErrorMessage } from '../utils/format';

function Dashboard() {
    const navigate = useNavigate();
    const user = getStoredUser();

    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');

    const isFrozen = account?.status === 'FROZEN';
    const isActive = account?.status === 'ACTIVE';

    const fetchDashboardData = async (showFullLoading = true) => {
        try {
            if (showFullLoading) {
                setIsLoading(true);
            }
            setApiError('');

            const [accountResponse, transactionsResponse] = await Promise.all([
                api.get('/api/account'),
                api.get('/api/transactions'),
            ]);

            setAccount(accountResponse.data);
            setTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized(navigate);
                return;
            }
            setApiError(getApiErrorMessage(error, 'Unable to load dashboard data. Please try again later.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const openModal = (type) => {
        setTransactionType(type);
        setAmount('');
        setModalError('');
        setModalSuccess('');
        setShowModal(true);
    };

    const closeModal = () => {
        if (isProcessing) return;
        setShowModal(false);
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalSuccess('');

        const numericAmount = Number(amount);
        if (!amount.trim()) {
            setModalError('Please enter an amount.');
            return;
        }
        if (numericAmount <= 0) {
            setModalError('Amount must be greater than zero.');
            return;
        }

        setIsProcessing(true);

        try {
            const endpoint =
                transactionType === 'deposit' ? '/api/account/deposit' : '/api/account/withdraw';

            await api.post(endpoint, { amount: numericAmount });

            setModalSuccess(
                transactionType === 'deposit'
                    ? 'Money deposited successfully.'
                    : 'Money withdrawn successfully.'
            );

            await fetchDashboardData(false);
            setAmount('');
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized(navigate);
                return;
            }
            setModalError(getApiErrorMessage(error, 'Transaction failed. Please try again.'));
        } finally {
            setIsProcessing(false);
        }
    };

    const welcomeName = user?.fullName || user?.email || 'Customer';
    const recentTransactions = transactions.slice(0, 5);

    const quickActions = [
        {
            id: 'deposit',
            label: 'Deposit',
            Icon: IconDeposit,
            disabled: !isActive,
            onClick: () => openModal('deposit'),
        },
        {
            id: 'withdraw',
            label: 'Withdraw',
            Icon: IconWithdraw,
            disabled: !isActive,
            onClick: () => openModal('withdraw'),
        },
        {
            id: 'transfer',
            label: 'Transfer',
            Icon: IconTransfer,
            disabled: !isActive,
            onClick: () => navigate('/transfer'),
        },
        {
            id: 'transactions',
            label: 'Transactions',
            Icon: IconTransactions,
            disabled: false,
            onClick: () => navigate('/transactions'),
        },
        {
            id: 'account',
            label: 'My Account',
            Icon: IconAccount,
            disabled: false,
            onClick: () => navigate('/my-account'),
        },
    ];

    return (
        <AppLayout title="Dashboard" subtitle={`Welcome back, ${welcomeName}`}>
            {isLoading && (
                <div className="loading-state">
                    <p>Loading dashboard...</p>
                </div>
            )}

            {!isLoading && apiError && <div className="alert alert--error">{apiError}</div>}

            {!isLoading && !apiError && account && (
                <>
                    <div className="welcome-banner">
                        <div>
                            <h2 className="welcome-banner__title">Welcome back, {welcomeName}</h2>
                            <p className="welcome-banner__subtitle">
                                Here&apos;s an overview of your account activity
                            </p>
                        </div>
                        <span className="welcome-banner__badge">
                            <IconAccount />
                            {account.accountNumber || 'Account'}
                        </span>
                    </div>

                    {isFrozen && (
                        <div className="alert alert--warning">
                            Your account is currently frozen. Deposits, withdrawals, and transfers
                            are unavailable until your account is reactivated.
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
                            <div className="account-card__hero-footer">
                                <div className="account-card__hero-detail">
                                    <span className="account-card__hero-detail-label">Account Number</span>
                                    <span className="account-card__hero-detail-value font-mono">
                                        {account.accountNumber || '--'}
                                    </span>
                                </div>
                                <div className="account-card__hero-detail">
                                    <span className="account-card__hero-detail-label">UPI ID</span>
                                    <span className="account-card__hero-detail-value">
                                        {account.upiId || '--'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="account-card__body">
                            <h3 className="section-title">Account Information</h3>
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
                        </div>
                    </section>

                    <section className="card">
                        <h2 className="card__title">Quick Actions</h2>
                        <p className="card__subtitle">Manage your money with one click</p>
                        <div className="quick-actions">
                            {quickActions.map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    className="action-card"
                                    disabled={action.disabled}
                                    onClick={action.onClick}
                                >
                                    <span className="action-card__icon">
                                        <action.Icon />
                                    </span>
                                    <span className="action-card__label">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="card">
                        <h2 className="card__title">Recent Transactions</h2>
                        <TransactionTable
                            transactions={recentTransactions}
                            emptyMessage="No recent transactions"
                            emptyHint="Deposits, withdrawals, and transfers will appear here once you start using your account."
                        />
                    </section>
                </>
            )}

            {showModal && (
                <Modal
                    title={transactionType === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}
                    onClose={closeModal}
                    disabled={isProcessing}
                >
                    <form onSubmit={handleTransaction} className="modal__form">
                        <div className="form-group">
                            <label htmlFor="transactionAmount">Amount</label>
                            <div className="amount-input">
                                <span>₹</span>
                                <input
                                    id="transactionAmount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>

                        {modalError && <div className="alert alert--error">{modalError}</div>}
                        {modalSuccess && <div className="alert alert--success">{modalSuccess}</div>}

                        <button
                            type="submit"
                            className="btn btn--primary btn--block"
                            disabled={isProcessing}
                        >
                            {isProcessing
                                ? 'Processing...'
                                : transactionType === 'deposit'
                                  ? 'Deposit'
                                  : 'Withdraw'}
                        </button>
                    </form>
                </Modal>
            )}
        </AppLayout>
    );
}

export default Dashboard;
