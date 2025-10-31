import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../App';
import Header from '../components/layout/Header';
import TradingView from '../views/TradingView';
// FIX: Removed .tsx extension from import
import SettingsPage from './SettingsPage';
import WalletView from '../views/WalletView';
import MarketsView from '../views/MarketsView';
// FIX: Corrected import path to point to the correct file name.
import CopyTradingView from '../views/CopyTradingView';
import InvestmentView from '../views/InvestmentView';
import { User, UserRole, CryptoAsset, UserStatus, TransactionType, Transaction } from '../types';
import BottomNavBar from '../components/layout/BottomNavBar';
import { useTranslation } from '../contexts/LanguageContext';
// FIX: Removed .tsx extension from import
import KYCPage from './KYCPage';
import Modal from '../components/ui/Modal';
import { ExclamationTriangleIcon, SparklesIcon } from '../components/ui/Icons';
import ActionNotification from '../components/ui/ActionNotification';
import FinancialAssistant from '../components/ai/FinancialAssistant';

const DashboardPage: React.FC = () => {
  const context = useContext(AppContext);
  const [activeView, setActiveView] = useState('wallet');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();
  const [isKycModalOpen, setKycModalOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  
  const [tradingViewSymbol, setTradingViewSymbol] = useState('BINANCE:BTCUSDT');

  if (!context || !context.user || !context.data) return null; // Wait for user and data
  const { user, data, updateUser, addTransaction, handleWithdrawalRequest, fileDispute, refundDispute, escalateDispute, cancelVaultVoucher, handleSubscribeToTrader, handleUnsubscribe, handleUpdateSubscriptionSettings, handleAddReview, handleExecuteTrade, areProfitsWithdrawable } = context;
  // FIX: Destructure config from context data
  const { assets, users, transactions, copyTraders, subscriptions, investmentPlans, agentProfitConfig } = data;


  if (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) {
    return <div className="p-8 text-red-500">Access Denied.</div>;
  }
  
  const isVerified = user.status === UserStatus.VERIFIED;

  const handleCloseNotification = () => {
    if(user) {
        updateUser({ ...user, notification: undefined });
    }
  };
  
  const todaysProfit = useMemo(() => {
      const today = new Date();
      if (today.getDay() === 0 || today.getDay() === 6) return 0; // No profit on weekends

      if (!user) return 0;
      if (user.isAgent) {
          const agentLevel = agentProfitConfig.levels.find(l => l.level === user.agentLevel) || agentProfitConfig.levels[0];
          return user.invested * agentLevel.profitRate;
      }
      // FIX: Use investmentPlans from context
      const plan = investmentPlans.find(p => p.id === user.activePlanId);
      if (plan && user.invested > 0) return user.invested * plan.dailyProfitRate;
      return 0;
  }, [user, agentProfitConfig, investmentPlans]);

  const handleInvest = async (amount: number, planId: string) => {
    if (!user || amount <= 0 || amount > user.balance) return false;
    
    const isFirstInvestment = user.invested <= 0;
    const userUpdatePayload: Partial<User> = {
        balance: user.balance - amount,
        invested: user.invested + amount,
        activePlanId: planId,
    };

    if (isFirstInvestment) {
        userUpdatePayload.investmentStartDate = new Date().toISOString();
    }

    await updateUser({ ...user, ...userUpdatePayload } as User);
    // FIX: Add missing status property
    await addTransaction({ description: `Invested in plan ${planId}`, amount: -amount, type: TransactionType.INVESTMENT, status: 'Completed' });
    return true;
  };

  const handleWithdrawProfit = async () => {
      if (!user || user.unclaimedProfit <= 0 || !areProfitsWithdrawable) return false;
      const profitToWithdraw = user.unclaimedProfit;
      await updateUser({ ...user, balance: user.balance + profitToWithdraw, unclaimedProfit: 0 });
      // FIX: Add missing status property
      await addTransaction({ description: `Investment Profit Withdrawal`, amount: profitToWithdraw, type: TransactionType.PROFIT, status: 'Completed' });
      return true;
  };

  const handleAddToInvestment = async (amount: number) => {
    if (!user || amount <= 0 || amount > user.balance) return false;
    await updateUser({ ...user, balance: user.balance - amount, invested: user.invested + amount });
    // FIX: Add missing status property
    await addTransaction({ description: `Added to investment`, amount: -amount, type: TransactionType.INVESTMENT, status: 'Completed' });
    return true;
  };

  const handleRequestInvestmentWithdrawal = async () => {
      if (!user || user.invested <= 0) return false;
      const alreadyRequested = transactions.some(tx => tx.userId === user.id && tx.type === TransactionType.INVESTMENT_WITHDRAWAL_REQUEST && tx.status === 'Awaiting Confirmation');
      if (alreadyRequested) return 'pending';
      // FIX: Corrected function call to pass status within the object
      await addTransaction({ description: 'Investment Withdrawal Request', amount: user.invested, type: TransactionType.INVESTMENT_WITHDRAWAL_REQUEST, status: 'Awaiting Confirmation' });
      return true;
  };

    const handleExecuteTradeWrapper = async (symbol: string, quantity: number, price: number, type: 'BUY' | 'SELL') => {
        const asset = data.assets.find(a => a.tradingViewSymbol === symbol);
        if (!asset) {
            console.error(`Asset with symbol ${symbol} not found for trading.`);
            return { success: false, error: 'tradeFailed' };
        }
        return handleExecuteTrade(asset.id, quantity, price, type);
    };

  const onVerifyClick = () => setKycModalOpen(true);

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'trading':
        return <TradingView tradingViewSymbol={tradingViewSymbol} setTradingViewSymbol={setTradingViewSymbol} onExecuteTrade={handleExecuteTradeWrapper} user={user} isVerified={isVerified} onVerifyClick={onVerifyClick} />;
      case 'wallet':
        return <WalletView 
            user={user} assets={assets} todaysProfit={todaysProfit} isVerified={isVerified} onVerifyClick={onVerifyClick} handleAddToInvestment={handleAddToInvestment} handleWithdrawProfit={handleWithdrawProfit}
            handleRequestInvestmentWithdrawal={handleRequestInvestmentWithdrawal} handleWithdrawalRequest={handleWithdrawalRequest} onFileDispute={fileDispute} onRefundDispute={refundDispute}
            onEscalateDispute={escalateDispute} onCancelVoucher={cancelVaultVoucher} areProfitsWithdrawable={areProfitsWithdrawable}
        />;
      case 'investment':
        return <InvestmentView user={user} allUsers={users} handleInvest={handleInvest} handleWithdrawProfit={handleWithdrawProfit} handleRequestInvestmentWithdrawal={handleRequestInvestmentWithdrawal} todaysProfit={todaysProfit} handleAddToInvestment={handleAddToInvestment} isVerified={isVerified} onVerifyClick={onVerifyClick} areProfitsWithdrawable={areProfitsWithdrawable} />;
      case 'markets':
        return <MarketsView setTradingViewSymbol={setTradingViewSymbol} setActiveView={setActiveView} />;
      case 'copy-trading':
        return <CopyTradingView 
            user={user} traders={copyTraders} subscriptions={subscriptions} onSubscribe={handleSubscribeToTrader} onUnsubscribe={handleUnsubscribe}
            onUpdateSettings={handleUpdateSubscriptionSettings} onAddReview={handleAddReview} isVerified={isVerified} onVerifyClick={onVerifyClick}
        />;
      default:
        return <WalletView 
            user={user} assets={assets} todaysProfit={todaysProfit} isVerified={isVerified} onVerifyClick={onVerifyClick} handleAddToInvestment={handleAddToInvestment} handleWithdrawProfit={handleWithdrawProfit}
            handleRequestInvestmentWithdrawal={handleRequestInvestmentWithdrawal} handleWithdrawalRequest={handleWithdrawalRequest} onFileDispute={fileDispute} onRefundDispute={refundDispute}
            onEscalateDispute={escalateDispute} onCancelVoucher={cancelVaultVoucher} areProfitsWithdrawable={areProfitsWithdrawable}
        />;
    }
  };
  
  const mainContentClass = (activeView === 'trading') ? 'flex-1 overflow-hidden pb-20' : 'flex-1 p-4 sm:p-6 pb-24 overflow-y-auto';

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-100">
       {user.notification && (
          <ActionNotification
            type={user.notification.type}
            reason={user.notification.reason}
            onClose={handleCloseNotification}
          />
        )}
       <SettingsPage 
           isOpen={isSettingsOpen} 
           onClose={() => setSettingsOpen(false)} 
           onNavigateToWallet={() => {
               setSettingsOpen(false);
               setActiveView('wallet');
           }}
       />
        <Modal isOpen={isKycModalOpen} onClose={() => setKycModalOpen(false)} title={t('kyc')} size="lg">
            <KYCPage onCompletion={() => setKycModalOpen(false)} />
        </Modal>

        {isAssistantOpen && <FinancialAssistant onClose={() => setAssistantOpen(false)} />}

      <main className="flex-1 flex flex-col h-screen">
        <Header onMenuClick={() => setSettingsOpen(true)} />
         {!isVerified && !user.isBanned && (
            <div className="bg-yellow-500/20 dark:bg-yellow-400/20 text-yellow-800 dark:text-yellow-200 p-3 text-center text-sm font-medium flex items-center justify-center gap-2 sticky top-16 z-10">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>{t('accountNotVerified')}</span>
                <button onClick={onVerifyClick} className="font-bold underline">{t('verifyNow')}</button>
            </div>
        )}
        <div id="main-content-area" className={mainContentClass}>
          {renderView()}
        </div>
      </main>
      
      <button 
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-24 right-5 z-30 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300"
        aria-label="Open AI Financial Assistant"
      >
        <SparklesIcon className="w-8 h-8" />
      </button>

      <BottomNavBar activeView={activeView} setActiveView={handleViewChange} />
    </div>
  );
};

export default DashboardPage;