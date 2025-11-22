import React, { useState } from 'react';
import { Subscription, CopyTrader, SubscriptionSettings } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import * as Icons from '../ui/Icons';
import Modal from '../ui/Modal';

interface SubscriptionItemProps {
    subscription: Subscription;
    trader: CopyTrader;
    onUnsubscribe: (id: string) => void;
    onUpdateSettings: (id: string, settings: SubscriptionSettings) => Promise<boolean>;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ subscription, trader, onUnsubscribe, onUpdateSettings }) => {
    const { t } = useTranslation();

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [currentSettings, setCurrentSettings] = useState<SubscriptionSettings>(subscription.settings);

    if (!trader) {
        return null; // Or a loading/error state
    }
    
    const { investedAmount, pnl } = subscription;
    const isProfit = pnl >= 0;
    const pnlColor = isProfit ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const IconComponent = (Icons as any)[trader.avatar] || Icons.UsersIcon;

    
    const handleConfirmUnsubscribe = () => {
        onUnsubscribe(subscription.id);
        setConfirmModalOpen(false);
    };

    const handleSaveSettings = () => {
        onUpdateSettings(subscription.id, currentSettings);
        setSettingsModalOpen(false);
    }
    
    const isEarlyUnsubscribe = new Date().getTime() - new Date(subscription.subscribedAt).getTime() < 7 * 24 * 60 * 60 * 1000;

    const SettingInput: React.FC<{label: string, value: number, onChange: (val: number) => void, min: number, max: number, step: number, unit?: string}> = 
    ({label, value, onChange, min, max, step, unit=""}) => (
        <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{label}: <span className="font-bold text-green-500">{value}{unit}</span></label>
            <input 
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
            />
        </div>
    );

    return (
        <>
            <div className="bg-white/60 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{trader.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('subscribed')}: {new Date(subscription.subscribedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                         <button onClick={() => setSettingsModalOpen(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <Icons.SettingsIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setConfirmModalOpen(true)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors">
                            <Icons.LogoutIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-700/50 pt-3">
                    <div className="flex justify-between">
                        <p className="text-gray-500 dark:text-gray-400">{t('investedAmount')}</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{investedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-500 dark:text-gray-400">{t('currentValue')}</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{subscription.currentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-500 dark:text-gray-400">{t('pnl')}</p>
                        <p className={`font-semibold ${pnlColor}`}>{isProfit ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                </div>
            </div>
            
            {/* Unsubscribe Modal */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} title={t('confirmAction')}>
                <div className="space-y-4">
                    <p>{t('unsubConfirm', { traderName: trader.name, amount: subscription.currentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) })}</p>
                    {isEarlyUnsubscribe && <p className="text-sm text-center font-semibold text-red-500 p-2 bg-red-500/10 rounded-lg">{t('earlyUnsubPenalty')}</p>}
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setConfirmModalOpen(false)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button onClick={handleConfirmUnsubscribe} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700">{t('confirm')}</button>
                    </div>
                </div>
            </Modal>
            
            {/* Settings Modal */}
             <Modal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} title={t('copySettings', {traderName: trader.name})}>
                <div className="space-y-4">
                    <div className="space-y-3 p-3 bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
                        <SettingInput label={t('copyRatio')} value={currentSettings.copyRatio} onChange={v => setCurrentSettings(s => ({...s, copyRatio: v}))} min={10} max={100} step={5} unit="%"/>
                        <SettingInput label={t('maxLot')} value={currentSettings.maxLot} onChange={v => setCurrentSettings(s => ({...s, maxLot: v}))} min={0.01} max={3.00} step={0.01} />
                        <SettingInput label={t('maxDailyTrades')} value={currentSettings.maxDailyTrades} onChange={v => setCurrentSettings(s => ({...s, maxDailyTrades: v}))} min={1} max={10} step={1} />
                        <SettingInput label={t('globalStopLoss')} value={currentSettings.globalStopLoss} onChange={v => setCurrentSettings(s => ({...s, globalStopLoss: v}))} min={5} max={50} step={1} unit="%"/>
                        <SettingInput label={t('dailyTarget')} value={currentSettings.dailyTarget} onChange={v => setCurrentSettings(s => ({...s, dailyTarget: v}))} min={3.5} max={5.0} step={0.1} unit="%"/>
                    </div>
                    <button onClick={handleSaveSettings} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">{t('saveSettings')}</button>
                </div>
             </Modal>
        </>
    );
};

export default SubscriptionItem;