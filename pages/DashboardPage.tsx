import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../App';
import Header from '../components/layout/Header';
import TradingView from '../views/TradingView';
import SettingsPage from './SettingsPage';
import WalletView from '../views/WalletView';
import MarketsView from '../views/MarketsView';
import CopyTradingView from '../views/PositionsView';
import InvestmentView from '../views/InvestmentView';
import { User, UserRole, UserStatus, TransactionType } from '../types';
import BottomNavBar from '../components/layout/BottomNavBar';
import { useTranslation } from '../contexts/LanguageContext';
import KYCPage from './KYCPage';
import Modal from '../components/ui/Modal';
import { ExclamationTriangleIcon } from '../components/ui/Icons';
import ActionNotification from '../components/ui/ActionNotification';
import NotificationPanel from '../components/layout/NotificationPanel';

const DashboardPage: React.FC = () => {
  const context = useContext(AppContext);
  const [activeView, setActiveView] = useState('wallet');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();
  const [isKycModalOpen, setKycModalOpen] = useState(false);
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
  
  const [tradingViewSymbol, setTradingViewSymbol] = useState('BINANCE:BTCUSDT');

  if (!context || !context.user || !context.data) return null; // Wait for user and data
  const { user, data, updateUser, addTransaction, handleWithdrawalRequest, fileDispute, refundDispute, escalateDispute, handleSubscribeToTrader, handleUnsubscribe, handleUpdateSubscriptionSettings, handleAddReview, handleExecuteTrade, areProfitsWithdrawable } = context;
  const { assets, users, transactions, copyTraders, subscriptions, investmentPlans, agentProfitConfig, notifications } = data;


  if (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) {
    return <div className="p-8 text-red-500 dark:text-red-400 font-semibold text-center">{t('accessDenied') || 'Access Denied.'}</div>;
  }
  
  const isVerified = user.status === UserStatus.VERIFIED;

  const handleToggleNotifications = () => {
      setNotificationPanelOpen(prev => !prev);
  }
  const unreadNotificationsCount = useMemo(() => notifications.filter(n => n.userId === user.id && !n.isRead).length, [notifications, user.id]);

  const handleCloseNotification = () => {
    if(user) {
        updateUser({ ...user, notification: undefined });
    }
  };

  const handleNotificationNavigate = (link: string) => {
    setActiveView(link);
    setNotificationPanelOpen(false);
  };

  const totalCopyTradingInvested = useMemo(() => {
    return subscriptions
      .filter(sub => sub.userId === user.id && sub.isActive)
      .reduce((total, sub) => total + sub.investedAmount, 0);
  }, [subscriptions, user.id]);
  
  const todaysProfit = useMemo(() => {
      const today = new Date();
      if (today.getDay() === 0 || today.getDay() === 6) return 0; // No profit on weekends

      if (!user) return 0;
      if (user.isAgent) {
          const agentLevel = agentProfitConfig.levels.find(l => l.level === user.agentLevel) || agentProfitConfig.levels[0];
          return user.invested * agentLevel.profitRate;
      }
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
    await addTransaction({ description: `Invested in plan ${planId}`, amount: -amount, type: TransactionType.INVESTMENT, status: 'Completed' });
    return true;
  };

  const handleWithdrawProfit = async () => {
      if (!user || user.unclaimedProfit <= 0 || !areProfitsWithdrawable) return false;
      const profitToWithdraw = user.unclaimedProfit;
      await updateUser({ ...user, balance: user.balance + profitToWithdraw, unclaimedProfit: 0 });
      await addTransaction({ description: `Investment Profit Withdrawal`, amount: profitToWithdraw, type: TransactionType.PROFIT, status: 'Completed' });
      return true;
  };

  const handleAddToInvestment = async (amount: number) => {
    if (!user || amount <= 0 || amount > user.balance) return false;
    await updateUser({ ...user, balance: user.balance - amount, invested: user.invested + amount });
    await addTransaction({ description: `Added to investment`, amount: -amount, type: TransactionType.INVESTMENT, status: 'Completed' });
    return true;
  };

  const handleRequestInvestmentWithdrawal = async () => {
      if (!user || user.invested <= 0) return false;
      const alreadyRequested = transactions.some(tx => tx.userId === user.id && tx.type === TransactionType.INVESTMENT_WITHDRAWAL_REQUEST && tx.status === 'Awaiting Confirmation');
      if (alreadyRequested) return 'pending';
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
            user={user} 
            users={users}
            assets={assets} 
            todaysProfit={todaysProfit} 
            isVerified={isVerified} 
            onVerifyClick={onVerifyClick} 
            handleAddToInvestment={handleAddToInvestment} 
            handleWithdrawProfit={handleWithdrawProfit}
            handleRequestInvestmentWithdrawal={handleRequestInvestmentWithdrawal} 
            handleWithdrawalRequest={handleWithdrawalRequest} 
            onFileDispute={fileDispute} 
            onRefundDispute={refundDispute}
            onEscalateDispute={escalateDispute} 
            areProfitsWithdrawable={areProfitsWithdrawable}
            totalCopyTradingInvested={totalCopyTradingInvested}
        />;
      case 'investment':
        return <InvestmentView user={user} allUsers={users} handleInvest={handleInvest} handleWithdrawProfit={handleWithdrawProfit} handleRequestInvestmentWithdrawal={handleRequestInvestmentWithdrawal} todaysProfit={todaysProfit} handleAddToInvestment={handleAddToInvestment} isVerified={isVerified} onVerifyClick={onVerifyClick} areProfitsWithdrawable={areProfitsWithdrawable} totalCopyTradingInvested={totalCopyTradingInvested} />;
      case 'markets':
        return <MarketsView setTradingViewSymbol={setTradingViewSymbol} setActiveView={setActiveView} />;
      case 'copy-trading':
        return <CopyTradingView 
            user={user} traders={copyTraders} subscriptions={subscriptions} onSubscribe={handleSubscribeToTrader} onUnsubscribe={handleUnsubscribe}
            onUpdateSettings={handleUpdateSubscriptionSettings} onAddReview={handleAddReview} isVerified={isVerified} onVerifyClick={onVerifyClick}
        />;
      default:
        return <WalletView 
            user={user} 
            users={users}
            assets={assets} 
            todaysProfit={todaysProfit} 
            isVerified={isVerified} 
            onVerifyClick={onVerifyClick} 
            handleAddToInvestment={handleAddToInvestment} 
            handleWithdrawProfit={handleWithdrawProfit}
            handleRequestInvestmentWithdrawal={handleRequestInvestmentWithdrawal} 
            handleWithdrawalRequest={handleWithdrawalRequest} 
            onFileDispute={fileDispute} 
            onRefundDispute={refundDispute}
            onEscalateDispute={escalateDispute} 
            areProfitsWithdrawable={areProfitsWithdrawable}
            totalCopyTradingInvested={totalCopyTradingInvested}
        />;
    }
  };
  
  const mainContentClass = (activeView === 'trading') ? 'flex-1 overflow-hidden pb-20' : 'flex-1 p-4 sm:p-6 pb-20 overflow-y-auto';

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-100">
       {user.notification && (
          <ActionNotification
            type={user.notification.type}
            reason={user.notification.reason}
            onClose={handleCloseNotification}
          />
        )}
       <SettingsPage isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
        <Modal isOpen={isKycModalOpen} onClose={() => setKycModalOpen(false)} title={t('kyc')} size="lg">
            <KYCPage onCompletion={() => setKycModalOpen(false)} />
        </Modal>

        <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} onNavigate={handleNotificationNavigate} />

      <main className="flex-1 flex flex-col h-screen">
        <Header onMenuClick={() => setSettingsOpen(true)} onNotificationsClick={handleToggleNotifications} unreadCount={unreadNotificationsCount} />
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

      <BottomNavBar activeView={activeView} setActiveView={handleViewChange} />
    </div>
  );
};

export default DashboardPage;