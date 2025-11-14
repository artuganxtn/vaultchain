
import React, { useState, useMemo, useContext } from 'react';
import { InvestmentPlan, User, UserStatus } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useTranslation } from '../contexts/LanguageContext';
import InvestmentCard from '../components/ui/InvestmentCard';
import { AppContext } from '../App';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface InvestmentViewProps {
    user: User;
    allUsers: User[];
    todaysProfit: number;
    isVerified: boolean;
    onVerifyClick: () => void;
    handleInvest: (amount: number, planId: string) => Promise<boolean>;
    handleWithdrawProfit: () => Promise<boolean>;
    handleRequestInvestmentWithdrawal: () => Promise<boolean | 'pending'>;
    handleAddToInvestment: (amount: number) => Promise<boolean>;
    areProfitsWithdrawable: boolean;
    // FIX: Add missing totalCopyTradingInvested prop
    totalCopyTradingInvested: number;
}

const generateChartData = (rate: number) => {
    const data = [];
    let value = 100;
    for (let i = 0; i < 10; i++) {
        data.push({ value });
        value += value * rate * (Math.random() * 0.5 + 0.8);
    }
    return data;
};


const PlanCard: React.FC<{ plan: InvestmentPlan, onSelect: () => void, user: User, onVerifyClick: () => void, isActive: boolean }> = ({ plan, onSelect, user, onVerifyClick, isActive }) => {
    const { t } = useTranslation();
    const canAfford = user.balance >= plan.minInvestment;
    const canInvest = user.status === UserStatus.VERIFIED && !user.isFrozen && !user.isBanned;

    const chartData = useMemo(() => generateChartData(plan.dailyProfitRate), [plan.dailyProfitRate]);

    const handleClick = () => {
        if (user.status !== UserStatus.VERIFIED) {
            onVerifyClick();
        } else if (canInvest && canAfford && !isActive) {
            onSelect();
        }
    };

    const getButtonText = () => {
        if (isActive) return t('activePlan');
        if (user.isBanned) return t('accountBanned');
        if (user.isFrozen) return t('accountFrozen');
        if (user.status !== UserStatus.VERIFIED) return t('verifyNow');
        if (!canAfford) return t('insufficientFunds');
        return t('investNow');
    };

    return (
        <Card className={`relative !p-0 overflow-hidden flex flex-col transition-all duration-300 ${isActive ? 'border-green-500 ring-2 ring-green-500/30' : ''}`}>
            {isActive && (
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">{t('active', {defaultValue: 'Active'})}</div>
            )}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                 <h4 className="text-lg font-bold text-gray-900 dark:text-white">{t(plan.nameKey)}</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">{t('minAmount')}: {plan.minInvestment.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
            </div>
            <div className="p-4 flex-grow space-y-2">
                <p className="text-3xl font-bold text-green-500 dark:text-green-400">{(plan.dailyProfitRate * 100).toFixed(2)}%</p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dailyProfit')}</p>
            </div>
             <div className="h-20 w-full -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`plan-grad-${plan.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill={`url(#plan-grad-${plan.id})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="p-4 mt-auto">
                <button 
                    onClick={handleClick} 
                    disabled={isActive || (!canAfford && canInvest)}
                    className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {getButtonText()}
                </button>
            </div>
        </Card>
    );
};


const InvestmentView: React.FC<InvestmentViewProps> = (props) => {
    const { user, handleInvest, onVerifyClick } = props;
    const { t } = useTranslation();
    const context = useContext(AppContext);
    const investmentPlans = context?.data?.investmentPlans || [];

    const [isInvestModalOpen, setInvestModalOpen] = useState(false);
    const [investAmount, setInvestAmount] = useState('');
    const [error, setError] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
    
    const onInvest = async () => {
        setError('');
        if (!selectedPlan) return;
        const amount = parseFloat(investAmount);
        if (isNaN(amount) || amount <= 0) {
            setError(t('amountRequired'));
            return;
        }
        if (amount < selectedPlan.minInvestment) {
            setError(t('minInvestmentError', {amount: selectedPlan.minInvestment.toLocaleString()}));
            return;
        }
        if (amount > user.balance) {
            setError(t('insufficientFunds'));
            return;
        }
        const success = await handleInvest(amount, selectedPlan.id);
        if (success) {
            setInvestAmount('');
            setInvestModalOpen(false);
            setSelectedPlan(null);
        }
    };

    const openInvestModal = (plan: InvestmentPlan) => {
        setSelectedPlan(plan);
        setInvestModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('investment')}</h2>
            
            <InvestmentCard 
                user={props.user}
                todaysProfit={props.todaysProfit}
                isVerified={props.isVerified}
                onVerifyClick={props.onVerifyClick}
                handleAddToInvestment={props.handleAddToInvestment}
                handleWithdrawProfit={props.handleWithdrawProfit}
                handleRequestInvestmentWithdrawal={props.handleRequestInvestmentWithdrawal}
                areProfitsWithdrawable={props.areProfitsWithdrawable}
                // FIX: Added missing totalCopyTradingInvested prop as indicated by the error.
                totalCopyTradingInvested={props.totalCopyTradingInvested}
            />
            
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 pt-4">{t('investmentPlans')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {investmentPlans.map(plan => (
                        <PlanCard 
                            key={plan.id} 
                            plan={plan} 
                            onSelect={() => openInvestModal(plan)} 
                            user={user} 
                            onVerifyClick={onVerifyClick}
                            isActive={user.activePlanId === plan.id}
                        />
                    ))}
                </div>
            </div>
            
            <Modal isOpen={isInvestModalOpen} onClose={() => { setInvestModalOpen(false); setError(''); setInvestAmount('') }} title={t('investIn', {planName: t(selectedPlan?.nameKey || '')})}>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                        <input 
                            type="number" 
                            value={investAmount} 
                            onChange={(e) => setInvestAmount(e.target.value)}
                            placeholder={`${t('minAmount')}: ${selectedPlan?.minInvestment.toLocaleString()}`}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('availableBalance')}: {user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        {error && <p className="text-red-500 text-xs mt-1 px-1">{error}</p>}
                    </div>
                    <button onClick={onInvest} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">{t('confirm')}</button>
                </div>
            </Modal>
        </div>
    );
};

export default InvestmentView;
