import React, { useState } from 'react';
import { CopyTrader, User, SubscriptionSettings, UserStatus } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import * as Icons from '../ui/Icons';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

const defaultSubscriptionSettings: SubscriptionSettings = {
    copyRatio: 100,
    maxLot: 1.0,
    maxDailyTrades: 5,
    globalStopLoss: 15,
    dailyTarget: 4,
    autoCopy: true,
};

const Stat: React.FC<{ label: string; value: string | number; icon: React.ReactElement<any> }> = ({ label, value, icon }) => (
    <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl flex items-center space-x-3 rtl:space-x-reverse">
        <div className="bg-green-500/10 p-2 rounded-lg">
            {React.cloneElement(icon, { className: "w-5 h-5 text-green-500" })}
        </div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-md font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const StarRatingDisplay: React.FC<{ rating: number, className?: string }> = ({ rating, className="w-5 h-5" }) => {
    return (
        <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <svg key={i} className={className} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" opacity={starValue <= rating ? 1 : 0.3} />
                    </svg>
                )
            })}
        </div>
    );
};

const StarRatingInput: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
         <div className="flex justify-center" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <button type="button" key={i} onMouseEnter={() => setHoverRating(starValue)} onClick={() => setRating(starValue)}>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className={(hoverRating || rating) >= starValue ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}/>
                        </svg>
                    </button>
                )
            })}
        </div>
    )
}

interface TraderDetailViewProps { 
    trader: CopyTrader; 
    user: User; 
    onBack: () => void; 
    onSubscribe: (traderId: string, amount: number, settings: SubscriptionSettings) => Promise<boolean>; 
    onAddReview: (traderId: string, rating: number, comment: string) => void; 
    isVerified: boolean; 
    onVerifyClick: () => void;
}

const TraderDetailView: React.FC<TraderDetailViewProps> = ({ trader, user, onBack, onSubscribe, onAddReview, isVerified, onVerifyClick }) => {
    const { t } = useTranslation();
    const IconComponent = (Icons as any)[trader.avatar] || Icons.UsersIcon;

    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const [isSubscribeModalOpen, setSubscribeModalOpen] = useState(false);
    const [investAmount, setInvestAmount] = useState('');
    const [settings, setSettings] = useState<SubscriptionSettings>(defaultSubscriptionSettings);
    const [error, setError] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    
    const hasReviewed = trader.reviews.some(r => r.reviewerName === user.name);
    
    const handleSubmitReview = async () => {
        if (reviewRating > 0 && reviewComment.trim() !== "") {
            setIsSubmittingReview(true);
            await onAddReview(trader.id, reviewRating, reviewComment);
            setIsSubmittingReview(false);
            setReviewModalOpen(false);
            setReviewRating(0);
            setReviewComment('');
        }
    };
    
    const canCopy = isVerified && !user.isFrozen && !user.isBanned;

    const getButtonText = () => {
        if (user.isBanned) return t('accountBanned');
        if (user.isFrozen) return t('accountFrozen');
        if (!isVerified) return t('verifyNow');
        return t('copyNow');
    };
    
    const openSubscribeModal = () => {
        if (!isVerified) {
            onVerifyClick();
            return;
        }
        if (canCopy) {
            setInvestAmount('');
            setError('');
            setSettings(defaultSubscriptionSettings);
            setSubscribeModalOpen(true);
        }
    };

    const handleSubscribe = async () => {
        setError('');
        const amount = parseFloat(investAmount);
        if (isNaN(amount) || amount <= 0) {
            setError(t('amountRequired'));
            return;
        }
        if (amount < 100) {
            setError(t('minCopyTradeError', { defaultValue: 'Minimum investment is $100.' }));
            return;
        }
        if (amount > user.balance) {
            setError(t('insufficientFunds'));
            return;
        }
        setIsSubscribing(true);
        const success = await onSubscribe(trader.id, amount, settings);
        if (success) {
            setSubscribeModalOpen(false);
        }
        setIsSubscribing(false);
    };
    
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

    const tooltipStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(5px)',
      border: `1px solid #E5E7EB`,
      borderRadius: '0.75rem',
    };
    
    const darkTooltipStyle = {
      backgroundColor: 'rgba(31, 41, 55, 0.8)',
      backdropFilter: 'blur(5px)',
      border: `1px solid #4B5563`,
      borderRadius: '0.75rem',
      color: '#F9FAFB'
    };


    return (
        <>
            <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-30 flex flex-col">
                
                <div className="flex-shrink-0 p-2 sm:p-4 flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse border-b border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Icons.ArrowLeftIcon />
                    </button>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse truncate">
                         <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{trader.name}</h2>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto scrollbar-hide pb-24">
                    <div className="p-4 sm:p-6 space-y-6">
                        <Card>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <StarRatingDisplay rating={trader.rating} />
                                <span className="text-sm text-gray-500 dark:text-gray-400">({trader.rating} / 5.0)</span>
                                {trader.id === 'trader_vc' && <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full">{t('Official')}</span>}
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Stat label={t('aum')} value={`$${(trader.aum / 1000000).toFixed(2)}M`} icon={<Icons.CurrencyDollarIcon />} />
                            <Stat label={t('followers')} value={trader.followers.toLocaleString()} icon={<Icons.UsersIcon />} />
                            <Stat label={t('winRate')} value={`${trader.winRate}%`} icon={<Icons.SparklesIcon />} />
                        </div>

                        <Card>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{'Performance'}</h3>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trader.performanceHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id={`colorProfit-${trader.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={'rgba(128,128,128,0.1)'} />
                                        <XAxis dataKey="month" stroke={'#6B7280'} tick={{ fontSize: 12, fill: 'currentColor' }} />
                                        <YAxis stroke={'#6B7280'} tick={{ fontSize: 12, fill: 'currentColor' }} unit="%" />
                                        <Tooltip contentStyle={document.documentElement.classList.contains('dark') ? darkTooltipStyle : tooltipStyle} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                                        <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill={`url(#colorProfit-${trader.id})`} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        
                         <Card>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('keyStats')}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2"><span className="text-gray-500 dark:text-gray-400">{t('avgDailyTrades')}</span><span className="font-semibold text-gray-800 dark:text-gray-200">{trader.avgDailyTrades}</span></div>
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2"><span className="text-gray-500 dark:text-gray-400">{t('profitShare')}</span><span className="font-semibold text-gray-800 dark:text-gray-200">{trader.profitShare}%</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('avgHoldingTime')}</span><span className="font-semibold text-gray-800 dark:text-gray-200">{trader.avgHoldingTime}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('riskLevel')}</span><span className="font-semibold text-gray-800 dark:text-gray-200">{t(trader.riskLevel)}</span></div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('strategy')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{trader.strategyDescription}</p>
                        </Card>
                        
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reviews')} ({trader.reviews.length})</h3>
                                {!hasReviewed && isVerified && <button onClick={() => setReviewModalOpen(true)} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">{t('leaveReview')}</button>}
                            </div>
                            <div className="space-y-4 max-h-72 overflow-y-auto">
                                {trader.reviews.length > 0 ? trader.reviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{review.reviewerName}</p>
                                            <StarRatingDisplay rating={review.rating} className="w-4 h-4" />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{review.comment}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-end mt-1">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                )) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noReviewsYet')}</p>}
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 z-10 px-4 sm:px-6 py-3 bg-gradient-to-t from-gray-100 via-gray-100/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 backdrop-blur-sm">
                    <button 
                        onClick={openSubscribeModal}
                        disabled={!canCopy && isVerified} 
                        className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-green-500/30 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {getButtonText()}
                    </button>
                </div>
            </div>

            {isReviewModalOpen && (
                <Modal isOpen={isReviewModalOpen} onClose={() => setReviewModalOpen(false)} title={t('leaveReview')}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('yourRating')}</label>
                            <StarRatingInput rating={reviewRating} setRating={setReviewRating} />
                        </div>
                        <div>
                            <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('yourComment')}</label>
                            <textarea 
                                id="review-comment"
                                rows={4}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <button 
                            onClick={handleSubmitReview}
                            disabled={reviewRating === 0 || reviewComment.trim() === "" || isSubmittingReview}
                            className="w-full py-2.5 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmittingReview ? t('submittingReview') : t('submitReview')}
                        </button>
                    </div>
                </Modal>
            )}
            
            <Modal isOpen={isSubscribeModalOpen} onClose={() => setSubscribeModalOpen(false)} title={t('subscribeTo', { traderName: trader.name })}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amountToInvest')}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={investAmount}
                                onChange={(e) => setInvestAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button onClick={() => setInvestAmount(user.balance.toString())} className="absolute inset-y-0 end-2 text-green-600 dark:text-green-400 text-sm font-bold">{t('max')}</button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('availableBalance')}: {user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        {error && <p className="text-red-500 text-xs mt-1 px-1">{error}</p>}
                    </div>
                    <div className="space-y-3 p-3 bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
                        <SettingInput label={t('copyRatio')} value={settings.copyRatio} onChange={v => setSettings(s => ({...s, copyRatio: v}))} min={10} max={100} step={5} unit="%"/>
                        <SettingInput label={t('maxLot')} value={settings.maxLot} onChange={v => setSettings(s => ({...s, maxLot: v}))} min={0.01} max={3.00} step={0.01} />
                        <SettingInput label={t('maxDailyTrades')} value={settings.maxDailyTrades} onChange={v => setSettings(s => ({...s, maxDailyTrades: v}))} min={1} max={10} step={1} />
                        <SettingInput label={t('globalStopLoss')} value={settings.globalStopLoss} onChange={v => setSettings(s => ({...s, globalStopLoss: v}))} min={5} max={50} step={1} unit="%"/>
                        <SettingInput label={t('dailyTarget')} value={settings.dailyTarget} onChange={v => setSettings(s => ({...s, dailyTarget: v}))} min={3.5} max={5.0} step={0.1} unit="%"/>
                    </div>
                    <button onClick={handleSubscribe} disabled={isSubscribing} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                        {isSubscribing ? t('subscribing') : t('subscribe')}
                    </button>
                </div>
            </Modal>
        </>
    );
};
export default TraderDetailView;