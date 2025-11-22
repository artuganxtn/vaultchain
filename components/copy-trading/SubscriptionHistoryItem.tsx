import React from 'react';
import { Subscription, CopyTrader } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import * as Icons from '../ui/Icons';

interface SubscriptionHistoryItemProps {
    subscription: Subscription;
    trader: CopyTrader;
}

const SubscriptionHistoryItem: React.FC<SubscriptionHistoryItemProps> = ({ subscription, trader }) => {
    const { t } = useTranslation();
    if (!trader) {
        return null; // Or a loading/error state
    }

    const { investedAmount, pnl, unsubscribedAt } = subscription;
    const isProfit = pnl >= 0;
    const pnlColor = isProfit ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const IconComponent = (Icons as any)[trader.avatar] || Icons.UsersIcon;

    return (
        <div className="bg-white/50 dark:bg-gray-800/40 opacity-80 rounded-lg p-3 space-y-2 border border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white">{trader.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('unsubscribed')}: {unsubscribedAt ? new Date(unsubscribedAt).toLocaleDateString() : '-'}
                        </p>
                    </div>
                </div>
                <div className="text-end">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('pnl')}</p>
                    <p className={`text-base font-bold ${pnlColor}`}>
                        {isProfit ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700/50 pt-2 flex justify-between items-center text-sm">
                <p className="text-gray-500 dark:text-gray-400">{t('investedAmount')}</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                    {investedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
            </div>
        </div>
    );
};

export default SubscriptionHistoryItem;
