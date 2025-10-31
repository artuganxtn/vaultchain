import React from 'react';
import { Transaction, TransactionType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

export const TransactionRow: React.FC<{ tx: Transaction; onSelect: (tx: Transaction) => void; }> = ({ tx, onSelect }) => {
    const { t } = useTranslation();
    const isCredit = tx.amount >= 0;
    const amountColor = isCredit ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const descriptionKey = tx.description.replace(/\s/g, '');
    
    // Determine dispute status text and color
    let disputeStatusText = '';
    let disputeStatusColor = '';
    if (tx.dispute) {
        switch (tx.dispute.status) {
            case 'Open':
                disputeStatusText = t('Open');
                disputeStatusColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                break;
            case 'Escalated':
                disputeStatusText = t('Escalated');
                disputeStatusColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
                break;
            case 'Refunded':
            case 'Resolved':
                disputeStatusText = t(tx.dispute.status);
                disputeStatusColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                break;
        }
    }

    return (
        <div 
            onClick={() => onSelect(tx)} 
            className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0 -mx-4 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/20"
        >
            <div>
                <p className="font-medium text-gray-900 dark:text-white">{t(descriptionKey, {defaultValue: tx.description})}</p>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()} - {t(tx.type.replace(/\s/g, ''))}</p>
                    {tx.dispute && (
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${disputeStatusColor}`}>
                             {disputeStatusText}
                         </span>
                    )}
                </div>
            </div>
            <div className="text-end">
                <p className={`font-semibold ${amountColor}`}>
                    {isCredit ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <p className={`text-xs ${tx.status === 'Completed' ? 'text-gray-500 dark:text-gray-400' : 'text-yellow-500 dark:text-yellow-400'}`}>{t(tx.status)}</p>
            </div>
        </div>
    );
};


export default TransactionRow;