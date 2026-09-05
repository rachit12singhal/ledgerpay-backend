import StatusBadge from './StatusBadge';
import { IconInbox } from './Icons';
import {
    formatBalance,
    formatDate,
    formatTransactionType,
    getTransactionTypeVariant,
} from '../utils/format';

function TransactionTable({ transactions, showParties = false, emptyMessage, emptyHint }) {
    if (!transactions.length) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">
                    <IconInbox />
                </div>
                <p className="empty-state__title">{emptyMessage || 'No transactions found'}</p>
                {emptyHint && <p className="empty-state__hint">{emptyHint}</p>}
            </div>
        );
    }

    return (
        <div className="data-table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        {showParties && (
                            <>
                                <th>From</th>
                                <th>To</th>
                            </>
                        )}
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => {
                        const typeVariant = getTransactionTypeVariant(transaction.type);

                        return (
                            <tr key={transaction.id ?? index}>
                                <td>
                                    <span className={`tx-type tx-type--${typeVariant}`}>
                                        {formatTransactionType(transaction.type)}
                                    </span>
                                </td>
                                {showParties && (
                                    <>
                                        <td>{transaction.senderAccountNumber || '--'}</td>
                                        <td>{transaction.receiverAccountNumber || '--'}</td>
                                    </>
                                )}
                                <td
                                    className={`data-table__amount data-table__amount--${typeVariant}`}
                                >
                                    {formatBalance(transaction.amount)}
                                </td>
                                <td>
                                    <StatusBadge status={transaction.status} />
                                </td>
                                <td className="data-table__date">
                                    {formatDate(transaction.createdAt)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionTable;
