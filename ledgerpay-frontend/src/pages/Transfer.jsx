import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Transfer.css';

function Transfer() {
    const navigate = useNavigate();

    const [transferMethod, setTransferMethod] = useState('account');

    const [accountNumber, setAccountNumber] = useState('');
    const [upiId, setUpiId] = useState('');
    const [amount, setAmount] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccessMessage('');
        setErrorMessage('');

        const numericAmount = Number(amount);

        if (
            transferMethod === 'account' &&
            !accountNumber.trim()
        ) {
            setErrorMessage(
                'Please enter the recipient account number.'
            );
            return;
        }

        if (
            transferMethod === 'upi' &&
            !upiId.trim()
        ) {
            setErrorMessage(
                'Please enter the recipient UPI ID.'
            );
            return;
        }

        if (!amount.trim()) {
            setErrorMessage(
                'Please enter an amount.'
            );
            return;
        }

        if (numericAmount <= 0) {
            setErrorMessage(
                'Amount must be greater than zero.'
            );
            return;
        }

        setIsLoading(true);

        try {
            const requestBody = {
                amount: numericAmount,
            };

            /*
             * Backend expects exactly one of:
             *
             * recipientAccountNumber
             * OR
             * recipientUpiId
             */

            if (transferMethod === 'account') {
                requestBody.recipientAccountNumber =
                    accountNumber.trim();
            } else {
                requestBody.recipientUpiId =
                    upiId.trim();
            }

            console.log(
                'Transfer request:',
                requestBody
            );

            const response = await api.post(
                '/api/transactions/transfer',
                requestBody
            );

            console.log(
                'Transfer response:',
                response.data
            );

            setSuccessMessage(
                'Money transferred successfully.'
            );

            setAccountNumber('');
            setUpiId('');
            setAmount('');

        } catch (error) {
            console.error(
                'Transfer error:',
                error
            );

            if (error.response) {
                console.log(
                    'Status:',
                    error.response.status
                );

                console.log(
                    'Response data:',
                    error.response.data
                );

                setErrorMessage(
                    error.response.data?.message ||
                    'Transfer failed. Please try again.'
                );

                if (error.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

            } else {
                setErrorMessage(
                    'Unable to connect to the server.'
                );
            }

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="transfer-page">

            <div className="transfer-card">

                <div className="transfer-header">

                    <button
                        className="transfer-back-button"
                        onClick={() =>
                            navigate('/dashboard')
                        }
                    >
                        ← Back
                    </button>

                    <h1>
                        Transfer Money
                    </h1>

                    <p>
                        Send money securely to another LedgerPay account.
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="transfer-form"
                >

                    <div className="transfer-method-section">

                        <label>
                            Send To
                        </label>

                        <div className="transfer-method-buttons">

                            <button
                                type="button"
                                className={
                                    transferMethod === 'account'
                                        ? 'transfer-method-button active'
                                        : 'transfer-method-button'
                                }
                                onClick={() => {
                                    setTransferMethod('account');
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                }}
                            >
                                Account Number
                            </button>

                            <button
                                type="button"
                                className={
                                    transferMethod === 'upi'
                                        ? 'transfer-method-button active'
                                        : 'transfer-method-button'
                                }
                                onClick={() => {
                                    setTransferMethod('upi');
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                }}
                            >
                                UPI ID
                            </button>

                        </div>

                    </div>

                    {transferMethod === 'account' && (

                        <div className="transfer-form-group">

                            <label htmlFor="accountNumber">
                                Recipient Account Number
                            </label>

                            <input
                                id="accountNumber"
                                type="text"
                                value={accountNumber}
                                onChange={(e) =>
                                    setAccountNumber(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter account number"
                                disabled={isLoading}
                            />

                        </div>

                    )}

                    {transferMethod === 'upi' && (

                        <div className="transfer-form-group">

                            <label htmlFor="upiId">
                                Recipient UPI ID
                            </label>

                            <input
                                id="upiId"
                                type="text"
                                value={upiId}
                                onChange={(e) =>
                                    setUpiId(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter UPI ID"
                                disabled={isLoading}
                            />

                        </div>

                    )}

                    <div className="transfer-form-group">

                        <label htmlFor="transferAmount">
                            Amount
                        </label>

                        <div className="transfer-amount-wrapper">

                            <span>
                                ₹
                            </span>

                            <input
                                id="transferAmount"
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
                                disabled={isLoading}
                            />

                        </div>

                    </div>

                    {errorMessage && (
                        <p className="transfer-error">
                            {errorMessage}
                        </p>
                    )}

                    {successMessage && (
                        <p className="transfer-success">
                            {successMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="transfer-submit-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Processing Transfer...'
                            : 'Transfer Money'
                        }
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Transfer;