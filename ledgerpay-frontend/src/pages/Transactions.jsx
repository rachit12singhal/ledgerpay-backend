import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Transactions.css';

function Transactions() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/api/transactions');

            const transactionData = response.data;

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
            if (error.response) {
                if (error.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
            }

            setApiError('Unable to load your transactions. Please try again later.');
        } finally {
            setIsLoading(false);
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

    return (
        <div className="transactions-page">
            <div className="transactions-card">
                <div className="transactions-header">
                    <h1 className="transactions-title">Transactions</h1>
                    <button
                        className="back-to-dashboard-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>

                {isLoading && (
                    <div className="transactions-status">
                        <p>Loading your transactions...</p>
                    </div>
                )}

                {!isLoading && apiError && (
                    <div className="transactions-status transactions-error">
                        <p>{apiError}</p>
                    </div>
                )}

                {!isLoading && !apiError && transactions.length === 0 && (
                    <div className="transactions-empty-state">
                        <p>No recent transactions</p>
                    </div>
                )}

                {!isLoading && !apiError && transactions.length > 0 && (
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
            </div>
        </div>
    );
}

export default Transactions;