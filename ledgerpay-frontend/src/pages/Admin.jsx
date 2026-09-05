import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import TransactionTable from '../components/TransactionTable';
import { handleUnauthorized } from '../utils/auth';
import { formatBalance, getApiErrorMessage } from '../utils/format';
import { IconUsers, IconActivity, IconReceipt, IconLock } from '../components/Icons';

function Admin() {
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState('');
    const [forbidden, setForbidden] = useState(false);
    const [processingAccountNumber, setProcessingAccountNumber] = useState(null);

    const fetchAdminData = async () => {
        try {
            setApiError('');

            const [accountsResponse, transactionsResponse] = await Promise.all([
                api.get('/api/admin/accounts'),
                api.get('/api/admin/transactions'),
            ]);

            setAccounts(Array.isArray(accountsResponse.data) ? accountsResponse.data : []);
            setTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
            setForbidden(false);
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized(navigate);
                return;
            }
            if (error.response?.status === 403) {
                setForbidden(true);
                return;
            }
            setApiError(getApiErrorMessage(error, 'Unable to load admin data. Please try again later.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleFreeze = async (accountNumber) => {
        setProcessingAccountNumber(accountNumber);
        try {
            await api.post(`/api/account/${accountNumber}/freeze`);
            await fetchAdminData();
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized(navigate);
                return;
            }
            if (error.response?.status === 403) {
                setForbidden(true);
                return;
            }
            setApiError(getApiErrorMessage(error, 'Unable to freeze this account. Please try again.'));
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
            if (error.response?.status === 401) {
                handleUnauthorized(navigate);
                return;
            }
            if (error.response?.status === 403) {
                setForbidden(true);
                return;
            }
            setApiError(getApiErrorMessage(error, 'Unable to unfreeze this account. Please try again.'));
        } finally {
            setProcessingAccountNumber(null);
        }
    };

    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE').length;
    const frozenAccounts = accounts.filter((a) => a.status === 'FROZEN').length;
    const totalTransactions = transactions.length;

    if (isLoading) {
        return (
            <AppLayout title="Admin Dashboard" subtitle="System overview and account management">
                <div className="loading-state">
                    <p>Loading admin dashboard...</p>
                </div>
            </AppLayout>
        );
    }

    if (forbidden) {
        return (
            <AppLayout title="Admin Dashboard">
                <div className="alert alert--error">
                    You do not have permission to access the admin dashboard.
                </div>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Admin Dashboard" subtitle="System overview and account management">
            {apiError && <div className="alert alert--error">{apiError}</div>}

            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__header">
                        <span className="stat-card__label">Total Accounts</span>
                        <span className="stat-card__icon">
                            <IconUsers />
                        </span>
                    </div>
                    <span className="stat-card__value">{totalAccounts}</span>
                </div>
                <div className="stat-card stat-card--active">
                    <div className="stat-card__header">
                        <span className="stat-card__label">Active Accounts</span>
                        <span className="stat-card__icon">
                            <IconActivity />
                        </span>
                    </div>
                    <span className="stat-card__value">{activeAccounts}</span>
                </div>
                <div className="stat-card stat-card--frozen">
                    <div className="stat-card__header">
                        <span className="stat-card__label">Frozen Accounts</span>
                        <span className="stat-card__icon">
                            <IconLock />
                        </span>
                    </div>
                    <span className="stat-card__value">{frozenAccounts}</span>
                </div>
                <div className="stat-card stat-card--transactions">
                    <div className="stat-card__header">
                        <span className="stat-card__label">Total Transactions</span>
                        <span className="stat-card__icon">
                            <IconReceipt />
                        </span>
                    </div>
                    <span className="stat-card__value">{totalTransactions}</span>
                </div>
            </section>

            <section className="card">
                <h2 className="card__title">Account Management</h2>
                <p className="card__subtitle">View and manage all customer accounts</p>

                {accounts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">
                            <IconUsers />
                        </div>
                        <p className="empty-state__title">No accounts found</p>
                        <p className="empty-state__hint">
                            Registered customer accounts will appear here for management.
                        </p>
                    </div>
                ) : (
                    <div className="data-table-wrapper">
                        <table className="data-table data-table--wide">
                            <thead>
                                <tr>
                                    <th>Account Number</th>
                                    <th>UPI ID</th>
                                    <th>Owner</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account, index) => (
                                    <tr
                                        key={account.accountNumber ?? index}
                                        className={
                                            account.status === 'FROZEN'
                                                ? 'data-table__row--frozen'
                                                : account.status === 'ACTIVE'
                                                  ? 'data-table__row--active'
                                                  : undefined
                                        }
                                    >
                                        <td className="font-mono">{account.accountNumber ?? '--'}</td>
                                        <td>{account.upiId ?? '--'}</td>
                                        <td>{account.ownerFullName ?? '--'}</td>
                                        <td className="data-table__amount">
                                            {formatBalance(account.balance)}
                                        </td>
                                        <td>
                                            <StatusBadge status={account.status} />
                                        </td>
                                        <td className="data-table__actions">
                                            {account.status === 'ACTIVE' && (
                                                <button
                                                    type="button"
                                                    className="btn btn--danger btn--sm"
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
                                                    type="button"
                                                    className="btn btn--success btn--sm"
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
                                                    <span className="text-muted">--</span>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="card">
                <h2 className="card__title">All Transactions</h2>
                <p className="card__subtitle">
                    {totalTransactions > 0
                        ? `${totalTransactions} transaction${totalTransactions === 1 ? '' : 's'} across all accounts`
                        : 'System-wide transaction activity'}
                </p>
                <TransactionTable
                    transactions={transactions}
                    showParties
                    emptyMessage="No transactions found"
                />
            </section>
        </AppLayout>
    );
}

export default Admin;
