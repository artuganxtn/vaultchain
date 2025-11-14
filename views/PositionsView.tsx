// DEV_NOTE: This file should be renamed to CopyTradingView.tsx for clarity.

import React, { useState, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { CopyTrader, Subscription, User, SubscriptionSettings } from '../types';
import Card from '../components/ui/Card';
import TraderCard from '../components/copy-trading/TraderCard';
import SubscriptionItem from '../components/copy-trading/SubscriptionItem';
import SubscriptionHistoryItem from '../components/copy-trading/SubscriptionHistoryItem';
import TraderDetailView from '../components/copy-trading/TraderDetailView';

interface CopyTradingViewProps {
    user: User;
    traders: CopyTrader[];
    subscriptions: Subscription[];
    isVerified: boolean;
    onVerifyClick: () => void;
    onSubscribe: (traderId: string, amount: number, settings: SubscriptionSettings) => Promise<boolean>;
    onUnsubscribe: (subscriptionId: string) => Promise<boolean>;
    onUpdateSettings: (subscriptionId: string, newSettings: SubscriptionSettings) => Promise<boolean>;
    onAddReview: (traderId: string, rating: number, comment: string) => Promise<void>;
}

const CopyTradingView: React.FC<CopyTradingViewProps> = ({ user, traders, subscriptions, isVerified, onVerifyClick, onSubscribe, onUnsubscribe, onUpdateSettings, onAddReview }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'discover' | 'subscriptions'>('discover');
    const [activeSubTab, setActiveSubTab] = useState<'active' | 'history'>('active');
    
    const [viewingTrader, setViewingTrader] = useState<CopyTrader | null>(null);

    // FIX: Filter subscriptions to only show for the current logged-in user.
    const activeSubscriptions = useMemo(() => subscriptions.filter(s => s.userId === user.id && s.isActive), [subscriptions, user.id]);
    const historicalSubscriptions = useMemo(() => subscriptions.filter(s => s.userId === user.id && !s.isActive), [subscriptions, user.id]);
    

    if (viewingTrader) {
        return (
            <TraderDetailView 
                trader={viewingTrader}
                user={user}
                onBack={() => setViewingTrader(null)}
                onSubscribe={onSubscribe}
                onAddReview={onAddReview}
                isVerified={isVerified}
                onVerifyClick={onVerifyClick}
            />
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('copyTrading')}</h2>

            <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 gap-1">
                <button 
                    onClick={() => setActiveTab('discover')} 
                    className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'discover' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                >
                    {t('discoverTraders')}
                </button>
                <button 
                    onClick={() => setActiveTab('subscriptions')} 
                    className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'subscriptions' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                >
                    {t('mySubscriptions')}
                </button>
            </div>
            
            {activeTab === 'discover' && (
                <div className="space-y-4">
                    {traders.map(trader => (
                        <TraderCard key={trader.id} trader={trader} onSelect={() => setViewingTrader(trader)} />
                    ))}
                </div>
            )}

            {activeTab === 'subscriptions' && (
                 <div className="space-y-4">
                     <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveSubTab('active')} 
                            className={`w-full py-2 rounded-md transition-colors text-xs font-semibold ${activeSubTab === 'active' ? 'bg-white dark:bg-gray-700 shadow text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            {t('activeSubscriptions')} ({activeSubscriptions.length})
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('history')} 
                            className={`w-full py-2 rounded-md transition-colors text-xs font-semibold ${activeSubTab === 'history' ? 'bg-white dark:bg-gray-700 shadow text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                           {t('history')}
                        </button>
                    </div>

                    {activeSubTab === 'active' && (
                        <div className="space-y-4">
                            {activeSubscriptions.length > 0 ? (
                                activeSubscriptions.map(sub => {
                                    const trader = traders.find(t => t.id === sub.traderId);
                                    if (!trader) return null;
                                    return <SubscriptionItem key={sub.id} subscription={sub} trader={trader} onUnsubscribe={onUnsubscribe} onUpdateSettings={onUpdateSettings}/>;
                                })
                            ) : (
                                <Card><p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noActiveSubscriptions')}</p></Card>
                            )}
                        </div>
                    )}

                     {activeSubTab === 'history' && (
                        <div className="space-y-4">
                            {historicalSubscriptions.length > 0 ? (
                                historicalSubscriptions.map(sub => {
                                    const trader = traders.find(t => t.id === sub.traderId);
                                    if (!trader) return null;
                                    return <SubscriptionHistoryItem key={sub.id} subscription={sub} trader={trader} />;
                                })
                            ) : (
                                <Card><p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noSubscriptionHistory')}</p></Card>
                            )}
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default CopyTradingView;