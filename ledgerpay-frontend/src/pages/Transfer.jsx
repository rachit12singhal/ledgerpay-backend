import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import { handleUnauthorized } from '../utils/auth';
import { getApiErrorMessage } from '../utils/format';

function Transfer() {
    const navigate = useNavigate();

    const [accountStatus, setAccountStatus] = useState(null);
    const [transferMethod, setTransferMethod] = useState('account');
    const [accountNumber, setAccountNumber] = useState('');
    const [upiId, setUpiId] = useState('');
    const [amount, setAmount] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAccount, setIsCheckingAccount] = useState(true);
    const [accountCheckError, setAccountCheckError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const checkAccount = async () => {
            try {
                const response = await api.get('/api/account');
                setAccountStatus(response.data.status);
            } catch (error) {
                if (error.response?.status === 401) {
                    handleUnauthorized(navigate);
                    return;
                }
                setAccountCheckError(
                    getApiErrorMessage(error, 'Unable to verify account status. Please try again.')
                );
            } finally {
                setIsCheckingAccount(false);
            }
        };

        checkAccount();
    }, [navigate]);

    const isFrozen = accountStatus === 'FROZEN';
    const canTransfer = accountStatus === 'ACTIVE';

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccessMessage('');
        setErrorMessage('');

        const numericAmount = Number(amount);

        if (transferMethod === 'account' && !accountNumber.trim()) {
            setErrorMessage('Please enter the recipient account number.');
            return;
        }

        if (transferMethod === 'upi' && !upiId.trim()) {
            setErrorMessage('Please enter the recipient UPI ID.');
            return;
        }

        if (!amount.trim()) {
            setErrorMessage('Please enter an amount.');
            return;
        }

        if (numericAmount <= 0) {
            setErrorMessage('Amount must be greater than zero.');
            return;
        }

        setIsLoading(true);

        try {
            const requestBody = { amount: numericAmount };

            if (transferMethod === 'account') {
                requestBody.recipientAccountNumber = accountNumber.trim();
            } else {
                requestBody.recipientUpiId = upiId.trim();
            }

            await api.post('/api/transactions/transfer', requestBody);

            setSuccessMessage('Money transferred successfully.');
            setAccountNumber('');
            setUpiId('');
            setAmount('');
        } catch (error) {
            if (error.response?.status === 401) {
                handleUnauthorized(navigate);
                return;
            }
            setErrorMessage(getApiErrorMessage(error, 'Transfer failed. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout title="Transfer Money" subtitle="Send money securely to another LedgerPay account">
            {isCheckingAccount && (
                <div className="loading-state">
                    <p>Checking account status...</p>
                </div>
            )}

            {!isCheckingAccount && accountCheckError && (
                <div className="alert alert--error">{accountCheckError}</div>
            )}

            {!isCheckingAccount && !accountCheckError && isFrozen && (
                <div className="alert alert--warning">
                    Your account is frozen. Transfers cannot be processed at this time.
                </div>
            )}

            {!isCheckingAccount && !accountCheckError && (
                <section className="card card--narrow">
                    <h2 className="card__title">Send Money</h2>
                    <p className="card__subtitle">Transfer funds to another LedgerPay account</p>

                    <form onSubmit={handleSubmit} className="transfer-form">
                        <div className="transfer-section">
                            <h3 className="transfer-section__title">Recipient</h3>
                            <div className="form-group">
                                <label className="form-label">Send To</label>
                                <p className="form-hint">Choose how to identify the recipient</p>
                                <div className="method-toggle">
                                    <button
                                        type="button"
                                        className={`method-toggle__btn${
                                            transferMethod === 'account'
                                                ? ' method-toggle__btn--active'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            setTransferMethod('account');
                                            setErrorMessage('');
                                            setSuccessMessage('');
                                        }}
                                        disabled={isLoading || !canTransfer}
                                    >
                                        Account Number
                                    </button>
                                    <button
                                        type="button"
                                        className={`method-toggle__btn${
                                            transferMethod === 'upi'
                                                ? ' method-toggle__btn--active'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            setTransferMethod('upi');
                                            setErrorMessage('');
                                            setSuccessMessage('');
                                        }}
                                        disabled={isLoading || !canTransfer}
                                    >
                                        UPI ID
                                    </button>
                                </div>
                            </div>

                            {transferMethod === 'account' && (
                                <div className="form-group">
                                    <label htmlFor="accountNumber">Recipient Account Number</label>
                                    <input
                                        id="accountNumber"
                                        type="text"
                                        className="form-input"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="Enter account number"
                                        disabled={isLoading || !canTransfer}
                                    />
                                </div>
                            )}

                            {transferMethod === 'upi' && (
                                <div className="form-group">
                                    <label htmlFor="upiId">Recipient UPI ID</label>
                                    <input
                                        id="upiId"
                                        type="text"
                                        className="form-input"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="Enter UPI ID"
                                        disabled={isLoading || !canTransfer}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="transfer-section">
                            <h3 className="transfer-section__title">Amount</h3>
                            <div className="form-group">
                                <label htmlFor="transferAmount">Transfer Amount</label>
                                <p className="form-hint">Enter the amount you want to send</p>
                                <div className="amount-input">
                                    <span>₹</span>
                                    <input
                                        id="transferAmount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        disabled={isLoading || !canTransfer}
                                    />
                                </div>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="transfer-feedback">
                                <div className="alert alert--error">{errorMessage}</div>
                            </div>
                        )}
                        {successMessage && (
                            <div className="transfer-feedback">
                                <div className="alert alert--success">{successMessage}</div>
                            </div>
                        )}

                        <div className="transfer-actions">
                        <button
                            type="submit"
                            className="btn btn--primary btn--block"
                            disabled={isLoading || !canTransfer}
                        >
                            {isLoading ? 'Processing Transfer...' : 'Transfer Money'}
                        </button>
                        </div>
                    </form>
                </section>
            )}
        </AppLayout>
    );
}

export default Transfer;
