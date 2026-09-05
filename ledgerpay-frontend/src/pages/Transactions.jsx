import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import TransactionTable from '../components/TransactionTable';
import { handleUnauthorized } from '../utils/auth';
import { getApiErrorMessage } from '../utils/format';

function Transactions() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState('');

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/api/transactions');
            setTransactions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized(navigate);
                return;
            }
            setApiError(getApiErrorMessage(error, 'Unable to load your transactions. Please try again later.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <AppLayout title="Transactions" subtitle="Your complete transaction history">
            {isLoading && (
                <div className="loading-state">
                    <p>Loading your transactions...</p>
                </div>
            )}

            {!isLoading && apiError && <div className="alert alert--error">{apiError}</div>}

            {!isLoading && !apiError && (
                <section className="card">
                    <h2 className="card__title">Transaction History</h2>
                    <p className="card__subtitle">
                        {transactions.length > 0
                            ? `${transactions.length} transaction${transactions.length === 1 ? '' : 's'} on record`
                            : 'All your account activity in one place'}
                    </p>
                    <TransactionTable
                        transactions={transactions}
                        showParties
                        emptyMessage="No transactions found"
                        emptyHint="Once you deposit, withdraw, or transfer money, your transactions will show up here."
                    />
                </section>
            )}
        </AppLayout>
    );
}

export default Transactions;
