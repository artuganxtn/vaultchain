
import React from 'react';
import { Transaction, TransactionType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import * as Icons from './Icons';

const TransactionRow: React.FC<{ tx: Transaction; onSelect: (tx: Transaction) => void; }> = ({ tx, onSelect }) => {
    const { t } = useTranslation();
    const isCredit = tx.amount >= 0;
    const amountColor = isCredit ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const descriptionKey = tx.description.replace(/\s/g, '');

    const typeIconMap: Record<string, React.ReactElement> = {
        [TransactionType.DEPOSIT]: <Icons.ArrowDownLeftIcon className="w-5 h-5 text-green-500" />,
        [TransactionType.WITHDRAWAL]: <Icons.ArrowUpRightIcon className="w-5 h-5 text-red-500" />,
        [TransactionType.INVESTMENT]: <Icons.InvestmentIcon className="w-5 h-5 text-blue-500" />,
        [TransactionType.INVESTMENT_WITHDRAWAL]: <Icons.InvestmentIcon className="w-5 h-5 text-green-500" />,
        [TransactionType.INVESTMENT_WITHDRAWAL_REQUEST]: <Icons.InvestmentIcon className="w-5 h-5 text-yellow-500" />,
        [TransactionType.PROFIT]: <Icons.ProfitIcon className="w-5 h-5 text-green-500" />,
        [TransactionType.BUY]: <Icons.TradingIcon className="w-5 h-5 text-blue-500" />,
        [TransactionType.SELL]: <Icons.TradingIcon className="w-5 h-5 text-green-500" />,
        [TransactionType.BONUS]: <Icons.GiftIcon className="w-5 h-5 text-yellow-500" />,
        [TransactionType.INTERNAL_TRANSFER]: isCredit ? <Icons.ArrowDownLeftIcon className="w-5 h-5 text-green-500" /> : <Icons.ArrowUpRightIcon className="w-5 h-5 text-red-500" />,
        [TransactionType.ADMIN_ADJUSTMENT]: <Icons.ShieldCheckIcon className="w-5 h-5 text-purple-500" />,
        [TransactionType.REFERRAL_BONUS]: <Icons.UsersIcon className="w-5 h-5 text-green-500" />,
        [TransactionType.COPY_TRADE_SUBSCRIBE]: <Icons.PositionsIcon className="w-5 h-5 text-blue-500" />,
        [TransactionType.COPY_TRADE_UNSUBSCRIBE]: <Icons.PositionsIcon className="w-5 h-5 text-green-500" />,
        [TransactionType.PENALTY_FEE]: <Icons.ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
        [TransactionType.COPY_TRADING_PROFIT]: <Icons.ProfitIcon className="w-5 h-5 text-green-500" />,
        [TransactionType.VAULT_VOUCHER_CREATE]: <Icons.TicketIcon className="w-5 h-5 text-red-500" />,
        [TransactionType.VAULT_VOUCHER_REDEEM]: <Icons.TicketIcon className="w-5 h-5 text-green-500" />,
    };

    const icon = typeIconMap[tx.type] || <Icons.CurrencyDollarIcon className="w-5 h-5 text-gray-500" />;

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
            className="flex items-center space-x-4 rtl:space-x-reverse py-3 -mx-4 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/20"
        >
            <div className="flex-shrink-0 w-8 flex justify-center">{icon}</div>
            <div className="flex-1">
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
