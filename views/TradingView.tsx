
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { User } from '../types';
import TradingViewWidget from '../components/ui/TradingViewWidget';
import { AppContext } from '../App';
import Modal from '../components/ui/Modal';
import * as Icons from '../components/ui/Icons';

interface TradingViewProps {
    tradingViewSymbol: string;
    setTradingViewSymbol: (symbol: string) => void;
    user: User;
    onExecuteTrade: (tradingViewSymbol: string, quantity: number, price: number, type: 'BUY' | 'SELL') => Promise<{ success: boolean, error?: string }>;
    isVerified: boolean;
    onVerifyClick: () => void;
}

const TradingView: React.FC<TradingViewProps> = ({ tradingViewSymbol, setTradingViewSymbol, user, onExecuteTrade, isVerified, onVerifyClick }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    
    // State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
    const [quantity, setQuantity] = useState(''); // Asset quantity (e.g., "0.5")
    const [usdAmount, setUsdAmount] = useState(''); // USD value (e.g., "34000")
    const [tradeFeedback, setTradeFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [tradeConfirmation, setTradeConfirmation] = useState<{ type: 'BUY' | 'SELL', quantity: number, total: number } | null>(null);

    // Memoized asset data
    const currentAsset = useMemo(() => context?.data?.assets.find(a => a.tradingViewSymbol === tradingViewSymbol), [tradingViewSymbol, context?.data?.assets]);

    // Handle input changes with cross-calculation
    const handleQuantityChange = (value: string) => {
        setQuantity(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && currentAsset) {
            const price = tradeType === 'BUY' ? currentAsset.ask : currentAsset.bid;
            setUsdAmount((numValue * price).toFixed(2));
        } else {
            setUsdAmount('');
        }
    };

    const handleUsdAmountChange = (value: string) => {
        setUsdAmount(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && currentAsset) {
            const price = tradeType === 'BUY' ? currentAsset.ask : currentAsset.bid;
            setQuantity((numValue / price).toPrecision(6));
        } else {
            setQuantity('');
        }
    };
    
    // Clear inputs when switching trade type
    useEffect(() => {
        setQuantity('');
        setUsdAmount('');
    }, [tradeType]);


    if (!currentAsset) {
        return <div className="flex items-center justify-center h-full p-4"><p className="text-gray-500">{t('loadingChartData')}</p></div>;
    }
    
    const userPortfolioItem = user.portfolio.find(item => item.assetId === currentAsset.id);
    const userAssetQuantity = userPortfolioItem?.quantity || 0;
    
    const numQuantity = parseFloat(quantity);
    const numUsdAmount = parseFloat(usdAmount);

    const insufficientFunds = tradeType === 'BUY' && !isNaN(numUsdAmount) && numUsdAmount > user.balance;
    const insufficientAssets = tradeType === 'SELL' && !isNaN(numQuantity) && numQuantity > userAssetQuantity;
    const canTrade = !user.isFrozen && !user.isBanned && !insufficientFunds && !insufficientAssets && !isNaN(numQuantity) && numQuantity > 0 && isVerified;

    const handleTradeClick = () => {
        if (user.isFrozen || user.isBanned) return;
        if (!isVerified) {
            onVerifyClick();
            return;
        }
        if (canTrade && !isNaN(numQuantity) && !isNaN(numUsdAmount)) {
            setTradeConfirmation({ type: tradeType, quantity: numQuantity, total: numUsdAmount });
        }
    };
    
    const executeConfirmedTrade = async () => {
        if (!tradeConfirmation || !currentAsset) return;
        const { type, quantity } = tradeConfirmation;
        const priceToUse = type === 'BUY' ? currentAsset.ask : currentAsset.bid;
        const result = await onExecuteTrade(tradingViewSymbol, quantity, priceToUse, type);
        setTradeConfirmation(null);
        if (result.success) {
            setTradeFeedback({ type: 'success', message: t('tradeSuccess') });
            setQuantity('');
            setUsdAmount('');
        } else {
            setTradeFeedback({ type: 'error', message: t(result.error || 'tradeFailed', {defaultValue: result.error}) });
        }
        setTimeout(() => setTradeFeedback(null), 3000);
    };

    const isButtonDisabled = user.isFrozen || user.isBanned || isNaN(numQuantity) || numQuantity <= 0 || insufficientFunds || insufficientAssets;

    const buttonText = () => {
        if (user.isBanned) return t('accountBanned');
        if (user.isFrozen) return t('tradingDisabled');
        if (tradeType === 'BUY') {
            if (insufficientFunds) return t('insufficientFunds');
            return `${t('buy')} ${currentAsset.symbol}`;
        } else { // SELL
            if (insufficientAssets) return t('insufficientAssets');
            return `${t('sell')} ${currentAsset.symbol}`;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            {tradeFeedback && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-lg z-50 text-white transition-all duration-300 ${tradeFeedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {tradeFeedback.message}
                </div>
            )}

            {/* Chart Area with Drawer */}
            <div className="flex-grow relative overflow-hidden">
                {/* Overlay when drawer is open */}
                {isDrawerOpen && (
                    <div 
                        className="absolute inset-0 bg-black/40 z-10"
                        onClick={() => setIsDrawerOpen(false)}
                    ></div>
                )}
                
                <div className="h-full w-full">
                    <TradingViewWidget 
                        key={tradingViewSymbol} 
                        symbol={tradingViewSymbol}
                        onSymbolChange={setTradingViewSymbol}
                        isAdvanced={true}
                    />
                </div>
                
                {/* Trading Drawer */}
                <div 
                    className={`
                        absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg 
                        border-t border-gray-200 dark:border-gray-700/50 
                        rounded-t-2xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)]
                        transition-transform duration-300 ease-in-out z-20
                        ${isDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}
                    `}
                >
                    {/* Drawer Handle / Peek View */}
                    <div 
                        className="flex flex-col items-center justify-start pt-2 h-[48px] cursor-pointer"
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    >
                        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>

                    {/* Drawer Content / Expanded View */}
                    <div className="p-2 sm:p-3 pt-0 space-y-3">
                        <div className="flex bg-gray-200/60 dark:bg-gray-900/50 rounded-lg p-1">
                            <button onClick={() => setTradeType('BUY')} className={`w-full py-2 rounded-md transition-colors text-sm font-bold ${tradeType === 'BUY' ? 'bg-green-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('buy')}</button>
                            <button onClick={() => setTradeType('SELL')} className={`w-full py-2 rounded-md transition-colors text-sm font-bold ${tradeType === 'SELL' ? 'bg-red-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('sell')}</button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                             <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('quantity')}</label>
                                <div className="relative mt-1">
                                    <input 
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                        className="w-full text-start text-base font-semibold bg-gray-200/60 dark:bg-gray-900/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 border border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="0.00"
                                        disabled={!isVerified || user.isFrozen || user.isBanned}
                                    />
                                    <span className="absolute inset-y-0 end-2 flex items-center text-xs font-bold text-gray-500 dark:text-gray-400">{currentAsset.symbol}</span>
                                </div>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('amount')} (USD)</label>
                                <div className="relative mt-1">
                                    <input 
                                        type="number"
                                        value={usdAmount}
                                        onChange={(e) => handleUsdAmountChange(e.target.value)}
                                        className="w-full text-start text-base font-semibold bg-gray-200/60 dark:bg-gray-900/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 border border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="0.00"
                                        disabled={!isVerified || user.isFrozen || user.isBanned}
                                    />
                                     <span className="absolute inset-y-0 end-2 flex items-center text-xs font-bold text-gray-500 dark:text-gray-400">USD</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                            <span>{tradeType === 'BUY' ? t('availableBalance') : t('youOwn')}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {tradeType === 'BUY' 
                                    ? user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
                                    : `${userAssetQuantity.toFixed(4)} ${currentAsset.symbol}`
                                }
                            </span>
                        </div>
                        
                        <button
                            onClick={handleTradeClick}
                            disabled={isVerified && isButtonDisabled}
                            className={`w-full py-2.5 text-base font-bold rounded-xl text-white shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                tradeType === 'BUY' 
                                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-600/50' 
                                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
                            }`}
                        >
                           {!isVerified ? t('verifyNow') : buttonText()}
                        </button>
                    </div>
                </div>
            </div>
            
            {tradeConfirmation && (
                <Modal isOpen={!!tradeConfirmation} onClose={() => setTradeConfirmation(null)} title={t('confirmTrade')}>
                    <div className="space-y-4">
                        <p className="text-center text-lg dark:text-gray-200">
                            {t('tradeConfirmationMessage', { 
                                type: t(tradeConfirmation.type.toLowerCase() as 'buy' | 'sell'), 
                                quantity: tradeConfirmation.quantity.toPrecision(6), 
                                symbol: currentAsset.symbol,
                                total: tradeConfirmation.total.toLocaleString('en-US', {style: 'currency', currency: 'USD'})
                            })}
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setTradeConfirmation(null)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">{t('cancel')}</button>
                            <button onClick={executeConfirmedTrade} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white">{t('confirm')}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default TradingView;
