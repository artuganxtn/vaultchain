

import React, { useState, useContext, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Subscription, User } from '../types';
import { UsersIcon, CurrencyDollarIcon } from '../components/ui/Icons';
import { getLocaleFromLanguage, formatCurrency, formatDate } from '../utils/locale';


const StatCard: React.FC<{ title: string, value: string, icon: React.ReactElement<any> }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center space-x-4 rtl:space-x-reverse">
        <div className="bg-green-500/10 dark:bg-green-500/20 p-3 rounded-full">
            {React.cloneElement(icon, { className: "w-6 h-6 text-green-500 dark:text-green-400" })}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);


interface SubscriberRowProps {
    subscription: Subscription;
    user: User | undefined;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}

const SubscriberRow: React.FC<SubscriberRowProps & { locale: string }> = ({ subscription, user, isSelected, onToggleSelect, locale }) => {
    const { t } = useTranslation();
    return (
        <tr className="border-b border-gray-200 dark:border-gray-700/50">
            <td className="p-4 w-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(subscription.id)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
            </td>
            <td className="p-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{user?.name || '...'}</td>
            <td className="p-4 text-sm text-gray-900 dark:text-white font-mono whitespace-nowrap">
                {formatCurrency(subscription.investedAmount, locale)}
            </td>
             <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                 {formatDate(subscription.subscribedAt, locale)}
             </td>
        </tr>
    );
};


const CopyTradingManagementView: React.FC = () => {
    const { t, language } = useTranslation();
    const context = useContext(AppContext);
    const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState<string[]>([]);
    const [profitPercentage, setProfitPercentage] = useState('');
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const locale = getLocaleFromLanguage(language);

    if (!context || !context.data) return null;
    const { data, distributeCopyTradingProfits } = context;
    const { users, subscriptions } = data;

    const activeSubscriptions = useMemo(() => subscriptions.filter(s => s.isActive), [subscriptions]);

    const handleToggleSelect = (id: string) => {
        setSelectedSubscriptionIds(prev =>
            prev.includes(id) ? prev.filter(subId => subId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedSubscriptionIds(activeSubscriptions.map(s => s.id));
        } else {
            setSelectedSubscriptionIds([]);
        }
    };
    
    const handleDistribute = () => {
        const percentage = parseFloat(profitPercentage);
        if (isNaN(percentage) || percentage <= 0) {
            setFeedbackMessage(t('invalidPercentage'));
            return;
        }
        setConfirmModalOpen(true);
    };

    const confirmDistribution = async () => {
        try {
            const percentage = parseFloat(profitPercentage);
            await distributeCopyTradingProfits(selectedSubscriptionIds, percentage);
            setFeedbackMessage(t('profitsDistributedSuccess', { count: selectedSubscriptionIds.length }));
            setSelectedSubscriptionIds([]);
            setProfitPercentage('');
            setConfirmModalOpen(false);
            setTimeout(() => setFeedbackMessage(''), 4000);
        } catch (error: any) {
            console.error('[Copy Trading] Error distributing profits:', error);
            setFeedbackMessage(error?.message || t('operationFailed') || 'Failed to distribute profits');
            setTimeout(() => setFeedbackMessage(''), 5000);
        }
    }
    
    const totalSelectedInvestment = useMemo(() => {
        return activeSubscriptions
            .filter(s => selectedSubscriptionIds.includes(s.id))
            .reduce((sum, s) => sum + s.investedAmount, 0);
    }, [selectedSubscriptionIds, activeSubscriptions]);

    const totalInvestedAmount = useMemo(() => {
        return activeSubscriptions.reduce((sum, s) => sum + s.investedAmount, 0);
    }, [activeSubscriptions]);

    const isAllSelected = activeSubscriptions.length > 0 && selectedSubscriptionIds.length === activeSubscriptions.length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('copyTradingManagement')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('manageCopyTrading')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title={t('subscribers')} value={activeSubscriptions.length.toString()} icon={<UsersIcon />} />
                <StatCard title={t('investedAmount')} value={formatCurrency(totalInvestedAmount, locale)} icon={<CurrencyDollarIcon />} />
            </div>

            <Card className="p-0 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-4">
                                    <input type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                </th>
                                <th className="p-4 font-semibold">{t('user')}</th>
                                <th className="p-4 font-semibold">{t('investedAmount')}</th>
                                <th className="p-4 font-semibold">{t('subscribed')}</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                            {activeSubscriptions.length > 0 ? (
                                activeSubscriptions.map(sub => (
                                    <SubscriberRow
                                        key={sub.id}
                                        subscription={sub}
                                        user={users.find(u => u.id === sub.userId)}
                                        isSelected={selectedSubscriptionIds.includes(sub.id)}
                                        onToggleSelect={handleToggleSelect}
                                        locale={locale}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noSubscribers')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </Card>

            <Card>
                <div className="space-y-4 md:flex md:items-end md:space-y-0 md:space-x-4 rtl:space-x-reverse">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profitPercentage')}</label>
                        <div className="relative">
                             <input
                                type="number"
                                placeholder={t('enterProfitPercentage')}
                                value={profitPercentage}
                                onChange={e => setProfitPercentage(e.target.value)}
                                className="w-full ps-3 pe-8 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <span className="absolute inset-y-0 end-3 flex items-center text-gray-500 dark:text-gray-400">%</span>
                        </div>
                    </div>
                    <button
                        onClick={handleDistribute}
                        disabled={selectedSubscriptionIds.length === 0 || !profitPercentage}
                        title={selectedSubscriptionIds.length === 0 ? t('selectSubscribers') || "Please select at least one subscriber" : (!profitPercentage ? t('enterProfitPercentage') || "Please enter a profit percentage" : "")}
                        className="w-full md:w-auto px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('distributeProfits')}
                    </button>
                </div>
                 {feedbackMessage && <p className="text-center mt-4 text-sm font-medium text-green-600 dark:text-green-400">{feedbackMessage}</p>}
            </Card>
            
            <Modal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} title={t('confirmAction')}>
                 <div className="space-y-4">
                     <p>
                         {t('confirmProfitDistribution', { 
                            percentage: profitPercentage, 
                            count: selectedSubscriptionIds.length,
                            defaultValue: `Are you sure you want to distribute a ${profitPercentage}% profit to ${selectedSubscriptionIds.length} selected user(s)?`
                         })}
                    </p>
                    <p>
                        {t('totalSelectedInvestment', { 
                            amount: formatCurrency(totalSelectedInvestment, locale),
                            defaultValue: `Total investment of selected users: ${formatCurrency(totalSelectedInvestment, locale)}`
                         })}
                    </p>
                     <p>
                        {t('totalProfitToDistribute', { 
                            amount: formatCurrency(totalSelectedInvestment * (parseFloat(profitPercentage) / 100), locale),
                            defaultValue: `Total profit to be distributed: ${formatCurrency(totalSelectedInvestment * (parseFloat(profitPercentage) / 100), locale)}`
                         })}
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setConfirmModalOpen(false)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">{t('cancel')}</button>
                        <button onClick={confirmDistribution} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white">{t('confirm')}</button>
                    </div>
                 </div>
            </Modal>
        </div>
    );
};

export default CopyTradingManagementView;