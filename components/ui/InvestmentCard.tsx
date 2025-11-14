
import React, { useState } from 'react';
import { User } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { InvestmentIcon, ProfitIcon } from './Icons';
import Modal from './Modal';

interface InvestmentCardProps {
    user: User;
    todaysProfit: number;
    isCompact?: boolean;
    isVerified: boolean;
    onVerifyClick: () => void;
    handleAddToInvestment: (amount: number) => Promise<boolean>;
    handleWithdrawProfit: () => Promise<boolean>;
    handleRequestInvestmentWithdrawal: () => Promise<boolean | 'pending'>;
    areProfitsWithdrawable: boolean;
    totalCopyTradingInvested: number;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ user, todaysProfit, isCompact = false, isVerified, onVerifyClick, handleAddToInvestment, handleWithdrawProfit, handleRequestInvestmentWithdrawal, areProfitsWithdrawable, totalCopyTradingInvested }) => {
    const { t } = useTranslation();

    const [isInvestMoreModalOpen, setInvestMoreModalOpen] = useState(false);
    const [investMoreAmount, setInvestMoreAmount] = useState('');
    const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [isRequestSuccessModalOpen, setRequestSuccessModalOpen] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [isWithdrawProfitModalOpen, setWithdrawProfitModalOpen] = useState(false);
    const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

    const totalInvested = user.invested + totalCopyTradingInvested;


    const onInvestMore = async () => {
        const amountNum = parseFloat(investMoreAmount);
        if (isNaN(amountNum) || amountNum <= 0 || amountNum > user.balance) return;
        const success = await handleAddToInvestment(amountNum);
        if (success) {
            setInvestMoreAmount('');
            setInvestMoreModalOpen(false);
        }
    };

    const onRequestWithdrawal = async () => {
        const result = await handleRequestInvestmentWithdrawal();
        if (result === true) {
            setRequestSuccessModalOpen(true);
        } else if (result === 'pending') {
            setRequestError(t('requestPending'));
        }
        setWithdrawModalOpen(false);
    };
    
    const onConfirmWithdrawProfit = async () => {
        setIsProcessingWithdrawal(true);
        await handleWithdrawProfit();
        setIsProcessingWithdrawal(false);
        setWithdrawProfitModalOpen(false);
    };

    const cardHeight = isCompact ? 'h-56' : '';
    
    const getDisabledState = () => {
        const actionDisabled = !isVerified || !!user.isFrozen || !!user.isBanned;
        let disabledTitle = '';
        if (!isVerified) disabledTitle = t('verificationRequired');
        else if (user.isFrozen) disabledTitle = t('accountFrozen');
        else if (user.isBanned) disabledTitle = t('accountBanned');
        return { actionDisabled, disabledTitle };
    };

    const handleActionClick = (action: () => void) => {
        const { actionDisabled } = getDisabledState();
        if (actionDisabled) {
            if (!isVerified) onVerifyClick();
            return;
        }
        action();
    };

    const { actionDisabled, disabledTitle } = getDisabledState();

    return (
        <>
            <div className={`relative p-6 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-black text-white shadow-2xl flex flex-col justify-between ${cardHeight}`}>
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full"></div>
                
                <div className="flex justify-between items-start z-10">
                    <h2 className="text-2xl font-bold notranslate">vaultchain</h2>
                    <div className="text-right rtl:text-left">
                        <p className="text-sm font-medium text-white/80 flex items-center justify-end space-x-2 rtl:space-x-reverse">{t('investedAmount')} {totalInvested <= 0 && <span className="text-xs opacity-70">({t('unavailable')})</span>}</p>
                        <p className="text-3xl font-bold tracking-tight">
                            {totalInvested.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                    </div>
                </div>

                <div className="z-10 text-left rtl:text-right">
                    <p className="text-sm font-light text-white/90 flex items-center space-x-2 rtl:space-x-reverse">{t('unclaimedProfit')} <span className="text-xs opacity-70">({t('available')})</span></p>
                    <p className="font-mono text-lg tracking-widest text-white mt-1">
                        {user.unclaimedProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    { user.invested > 0 &&
                        <p className="text-xs text-green-300">(+{todaysProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} {t('todaysProfit')})</p>
                    }
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse z-10">
                    <button onClick={() => handleActionClick(() => setWithdrawModalOpen(true))} disabled={actionDisabled || user.invested <= 0} title={disabledTitle} className="flex-1 py-3 px-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors backdrop-blur-sm flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <ProfitIcon className="w-5 h-5"/>
                        <span>{t('withdrawCapital')}</span>
                    </button>
                     <button 
                        onClick={() => handleActionClick(() => setWithdrawProfitModalOpen(true))} 
                        disabled={actionDisabled || user.unclaimedProfit <= 0 || !areProfitsWithdrawable}
                        title={actionDisabled ? disabledTitle : (!areProfitsWithdrawable ? t('profitWithdrawalDisabled') : "")}
                        className="flex-1 py-3 px-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors backdrop-blur-sm flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <ProfitIcon className="w-5 h-5"/>
                        <span>{t('withdrawProfits')}</span>
                    </button>
                    {user.invested > 0 && (
                        <button onClick={() => handleActionClick(() => setInvestMoreModalOpen(true))} disabled={actionDisabled} title={disabledTitle} className="flex-1 py-3 px-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors backdrop-blur-sm flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            <InvestmentIcon className="w-5 h-5" />
                            <span>{t('investMore')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isInvestMoreModalOpen} onClose={() => setInvestMoreModalOpen(false)} title={t('investMore')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                        <input type="number" value={investMoreAmount} onChange={(e) => setInvestMoreAmount(e.target.value)} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('availableBalance')}: {user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    <button onClick={onInvestMore} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">{t('confirm')}</button>
                </div>
            </Modal>
            
            <Modal isOpen={isWithdrawModalOpen} onClose={() => { setWithdrawModalOpen(false); setRequestError('')}} title={t('requestWithdrawal')}>
                <div className="space-y-4">
                    <p>{t('requestWithdrawalConfirmation', { amount: user.invested.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) })}</p>
                    {requestError && <p className="text-red-500 text-sm text-center">{requestError}</p>}
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setWithdrawModalOpen(false)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button onClick={onRequestWithdrawal} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700">{t('confirm')}</button>
                    </div>
                </div>
            </Modal>
            
             <Modal isOpen={isWithdrawProfitModalOpen} onClose={() => setWithdrawProfitModalOpen(false)} title={t('withdrawProfits')}>
                <div className="space-y-4">
                    <p>{t('withdrawConfirmation', { amount: user.unclaimedProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) })}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setWithdrawProfitModalOpen(false)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">{t('cancel')}</button>
                        <button 
                            onClick={onConfirmWithdrawProfit}
                            disabled={isProcessingWithdrawal}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white disabled:opacity-50"
                        >
                            {isProcessingWithdrawal ? t('processing') : t('confirm')}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isRequestSuccessModalOpen} onClose={() => setRequestSuccessModalOpen(false)} title={t('requestSent')}>
                <div className="text-center py-4 space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{t('requestSentMessage')}</p>
                    <button onClick={() => setRequestSuccessModalOpen(false)} className="w-full py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('close')}</button>
                </div>
            </Modal>
        </>
    );
};

export default InvestmentCard;
