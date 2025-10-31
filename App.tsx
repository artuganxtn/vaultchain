



import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import { User, UserRole, Transaction, AddUserParams, TransactionType, UserStatus, Subscription, CopyTrader, Review, SubscriptionSettings, AuditLog, CryptoAsset, AppDataType } from './types';
import * as api from './services/api';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
// FIX: Removed import for backendLogic.ts as it's no longer used.
// import { simulateDailyProfitUpdate } from './services/backendLogic';

export const AppContext = React.createContext<{
  user: User | null;
  data: AppDataType | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signUp: (params: AddUserParams, referralCode?: string) => Promise<{ success: boolean; email?: string; error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUser: (user: User) => Promise<void>;
  updatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  // FIX: Updated addTransaction to accept status within the transaction object for consistency.
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => Promise<Transaction | void>;
  // FIX: Updated adminAddTransaction to accept status within the transaction object for consistency.
  adminAddTransaction: (userId: string, transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => Promise<Transaction>;
  handleDepositRequest: (amount: number, referenceCode: string, proofImageUrl: string, originalAmount?: number, originalCurrency?: string) => Promise<void>;
  approveDeposit: (transactionId: string) => Promise<void>;
  rejectDeposit: (transactionId: string) => Promise<void>;
  approveInvestmentWithdrawal: (transactionId: string) => Promise<void>;
  rejectInvestmentWithdrawal: (transactionId: string) => Promise<void>;
  fileDispute: (transactionId: string, reason: string, details: string) => Promise<boolean>;
  refundDispute: (transactionId: string) => Promise<void>;
  escalateDispute: (transactionId: string) => Promise<void>;
  resolveDispute: (transactionId: string, winnerId: string) => Promise<void>;
  handleWithdrawalRequest: (amount: number, details: Transaction['withdrawalDetails']) => Promise<void>;
  approveWithdrawal: (transactionId: string) => Promise<void>;
  rejectWithdrawal: (transactionId: string) => Promise<void>;
  createVaultVoucher: (amount: number) => Promise<string | null>;
  checkVaultVoucher: (code: string) => Promise<Transaction | null>;
  redeemVaultVoucher: (code: string) => Promise<string | boolean>;
  cancelVaultVoucher: (transactionId: string) => Promise<void>;
  submitKycDocuments: (documents: { [key: string]: string }) => Promise<void>;
  approveKyc: (userId: string) => Promise<void>;
  rejectKyc: (userId: string, reason: string) => Promise<void>;
  handleSubscribeToTrader: (traderId: string, amount: number, settings: SubscriptionSettings) => Promise<boolean>;
  handleUnsubscribe: (subscriptionId: string) => Promise<boolean>;
  handleUpdateSubscriptionSettings: (subscriptionId: string, newSettings: SubscriptionSettings) => Promise<boolean>;
  handleAddReview: (traderId: string, rating: number, comment: string) => Promise<void>;
  distributeCopyTradingProfits: (subscriptionIds: string[], percentage: number) => Promise<void>;
  addAuditLog: (action: string, details: string, targetUserId?: string) => Promise<void>;
  handleExecuteTrade: (assetId: string, quantity: number, price: number, type: 'BUY' | 'SELL') => Promise<{ success: boolean, error?: string }>;
  refetchData: () => Promise<void>;
  areProfitsWithdrawable: boolean;
  toggleProfitWithdrawal: () => void;
} | null>(null);


const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [data, setData] = useState<AppDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const FEE_COLLECTOR_EMAIL = 'khtab7342@gmail.com';
  const [areProfitsWithdrawable, setAreProfitsWithdrawable] = useState(() => localStorage.getItem('profits_withdrawable') === 'true');

  const addAuditLog = useCallback(async (action: string, details: string, targetUserId?: string) => {
      if (!loggedInUser) return;
      const newLog = await api.addAuditLog(loggedInUser.id, action, details, targetUserId);
      setData(prev => prev ? ({ ...prev, auditLogs: [newLog, ...prev.auditLogs] }) : null);
  }, [loggedInUser]);

  const toggleProfitWithdrawal = useCallback(() => {
    setAreProfitsWithdrawable(prev => {
        const newState = !prev;
        localStorage.setItem('profits_withdrawable', String(newState));
        addAuditLog('PROFIT_WITHDRAWAL_TOGGLED', `Profit withdrawal was ${newState ? 'ENABLED' : 'DISABLED'} for all users.`);
        return newState;
    });
  }, [addAuditLog]);

  // Initial data load
  useEffect(() => {
    const loadApp = async () => {
        setIsLoading(true);
        try {
            // Simulate server-side daily tasks before loading any data
            // This is now handled by the backend on data fetch
            // await simulateDailyProfitUpdate();

            // Now load the potentially updated data
            const allData = await api.getAllData();
            setData(allData);
            
            const storedUserId = localStorage.getItem('loggedInUserId');
            if (storedUserId) {
                const user = allData.users.find(u => u.id === storedUserId);
                if (user) {
                    setLoggedInUser(user);
                } else {
                    localStorage.removeItem('loggedInUserId');
                }
            }

        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadApp();
  }, []); // Run once on app startup
  
  const refetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allData = await api.getAllData();
      setData(allData);
      if (loggedInUser) {
        const freshUser = allData.users.find(u => u.id === loggedInUser.id);
        if (freshUser) setLoggedInUser(freshUser);
      }
    } catch (error) {
      console.error("Failed to refetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loggedInUser]);


  const login = async (identifier: string, pass: string): Promise<boolean> => {
    const user = await api.login(identifier, pass);
    if (user) {
      // Check if user needs to verify email (PendingOTP status)
      if (user.status === 'PendingOTP') {
        // User exists but email not verified - return false to show error
        return false;
      }
      setLoggedInUser(user);
      localStorage.setItem('loggedInUserId', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUserId');
  };
  
  const signUp = async (params: AddUserParams, referralCode?: string): Promise<{ success: boolean; email?: string; error?: string }> => {
    try {
        const result = await api.signUp(params, referralCode);
        // New signup flow: Returns { success: true, email } on success, or { error } on failure
        if ('success' in result && result.success) {
            // Signup successful, OTP sent to email
            return { success: true, email: (result as any).email };
        }
        // Error case
        return { success: false, error: (result as any).error || 'signUpError' };
    } catch (err: any) {
        return { success: false, error: err.message || 'signUpError' };
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const result = await api.verifyOTP(email, otp);
        if (result.success && result.user) {
            // OTP verified, account activated
            await refetchData();
            setLoggedInUser(result.user);
            localStorage.setItem('loggedInUserId', result.user.id);
            return { success: true, user: result.user };
        }
        return { success: false, error: result.error || 'invalidOTP' };
    } catch (err: any) {
        return { success: false, error: err.message || 'verificationError' };
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const response = await api.updateUser(updatedUser);
      // Use the response from the API to ensure we have the latest data
      const finalUser = response || updatedUser;
      setData(prev => prev ? ({ ...prev, users: prev.users.map(u => u.id === finalUser.id ? finalUser : u) }) : null);
      if (loggedInUser && loggedInUser.id === finalUser.id) {
          setLoggedInUser(finalUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };
  
  // FIX: Updated adminAddTransaction to have a consistent signature. It now takes only 2 arguments.
  const adminAddTransaction = async (userId: string, transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => {
    // FIX: Default status is now handled here, providing a consistent API.
    const txWithDefaults = { status: 'Completed' as const, ...transaction };
    const newTx = await api.addTransaction(userId, txWithDefaults);
    setData(prev => prev ? ({ ...prev, transactions: [newTx, ...prev.transactions] }) : null);
    return newTx;
  };

  // FIX: Updated addTransaction to match the new consistent signature.
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => {
    if (!loggedInUser) return;
    return adminAddTransaction(loggedInUser.id, transaction);
  };
  
  const approveDeposit = async (transactionId: string) => {
      const tx = data?.transactions.find(t => t.id === transactionId);
      if (!tx || !data) return;
      await api.approveDeposit(transactionId);
      // Manually replicate state changes to avoid full refetch
      await addAuditLog('APPROVE_DEPOSIT', `Approved $${tx.amount} deposit for user ID ${tx.userId}`, tx.userId);
      await refetchData(); // Some logic like referrals is too complex to replicate optimistically, refetch is safer here for now.
  };
  
  const rejectDeposit = async (transactionId: string) => {
      const tx = data?.transactions.find(t => t.id === transactionId);
      if (!tx) return;
      const updatedTx = {...tx, status: 'Failed' as const, description: 'Rejected Deposit'};
      await api.updateTransaction(updatedTx);
      setData(prev => prev ? ({ ...prev, transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t) }) : null);
      await addAuditLog('REJECT_DEPOSIT', `Rejected deposit for user ID ${tx.userId}`, tx.userId);
  };

  const approveInvestmentWithdrawal = async (transactionId: string) => {
      const tx = data?.transactions.find(t => t.id === transactionId);
      if(!tx || !data?.users) return;
      
      const userIndex = data.users.findIndex(u => u.id === tx.userId);
      if (userIndex === -1) return;
      
      const feeCollector = data.users.find(u => u.email === FEE_COLLECTOR_EMAIL);
      const user = data.users[userIndex];
      const amountInvested = user.invested;
      const profitWithdrawn = user.unclaimedProfit;
      let penalty = 0;

      // Check for early withdrawal penalty (less than 7 days) and apply 25% penalty on profits
      if (user.investmentStartDate && !user.isFeeExempt) {
          const investmentDuration = new Date().getTime() - new Date(user.investmentStartDate).getTime();
          if (investmentDuration < 7 * 24 * 60 * 60 * 1000) {
              penalty = profitWithdrawn * 0.25;
          }
      }

      const totalReturn = amountInvested + profitWithdrawn - penalty;
      
      let updatedUser: User = { ...user, balance: user.balance + totalReturn, invested: 0, unclaimedProfit: 0, activePlanId: null, investmentStartDate: undefined };
      const updatedTx: Transaction = { ...tx, status: 'Completed' as const, description: 'Approved Investment Withdrawal' };
      
      const investmentTx = await api.addTransaction(user.id, { description: 'Investment Withdrawn', amount: amountInvested, type: TransactionType.INVESTMENT_WITHDRAWAL, status: 'Completed' });
      const profitTx = profitWithdrawn > 0 ? await api.addTransaction(user.id, { description: 'Investment Profit Withdrawal', amount: profitWithdrawn, type: TransactionType.PROFIT, status: 'Completed' }) : null;
      
      let penaltyTx: Transaction | null = null;
      let feeTx: Transaction | null = null;
      let updatedCollector: User | undefined;

      if (penalty > 0) {
          penaltyTx = await api.addTransaction(user.id, { description: 'Early Investment Withdrawal Penalty', amount: -penalty, type: TransactionType.PENALTY_FEE, status: 'Completed' });
          if(feeCollector){
              updatedCollector = { ...feeCollector, balance: feeCollector.balance + penalty };
              await api.updateUser(updatedCollector);
              feeTx = await api.addTransaction(feeCollector.id, { description: `Penalty fee from ${user.name}`, amount: penalty, type: TransactionType.ADMIN_ADJUSTMENT, status: 'Completed' });
          }
      }
      
      await api.updateUser(updatedUser);
      await api.updateTransaction(updatedTx);

      setData(prev => {
          if (!prev) return null;
          const newUsers = prev.users.map(u => {
              if (u.id === updatedUser.id) return updatedUser;
              if (updatedCollector && u.id === updatedCollector.id) return updatedCollector;
              return u;
          });
          const newTxs = prev.transactions.map(t => t.id === transactionId ? updatedTx : t);
          if (feeTx) newTxs.unshift(feeTx);
          if (penaltyTx) newTxs.unshift(penaltyTx);
          if (profitTx) newTxs.unshift(profitTx);
          newTxs.unshift(investmentTx);
          return { ...prev, users: newUsers, transactions: newTxs };
      });

      await addAuditLog('APPROVE_INVESTMENT_WITHDRAWAL', `Approved investment withdrawal for ${user.name}`, user.id);
  };
  
  const rejectInvestmentWithdrawal = async (transactionId: string) => {
      const tx = data?.transactions.find(t => t.id === transactionId);
      if (!tx) return;
      const updatedTx = { ...tx, status: 'Failed' as const, description: 'Rejected Investment Withdrawal' };
      await api.updateTransaction(updatedTx);
      setData(prev => prev ? ({ ...prev, transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t) }) : null);
      await addAuditLog('REJECT_INVESTMENT_WITHDRAWAL', `Rejected investment withdrawal for user ID ${tx.userId}`, tx.userId);
  };

  const handleDepositRequest = async (amount: number, referenceCode: string, proofImageUrl: string, originalAmount?: number, originalCurrency?: string) => {
    if (!loggedInUser || amount <= 0) return;
    // FIX: Updated to pass status within the transaction object.
    await addTransaction({ description: 'Deposit Request', amount: amount, type: TransactionType.DEPOSIT, referenceCode, proofImageUrl, originalAmount, originalCurrency, status: 'Awaiting Confirmation' });
  };
  
  const handleWithdrawalRequest = async (amount: number, details: Transaction['withdrawalDetails']) => {
    if (!loggedInUser || !details || amount < 100 || amount > loggedInUser.balance) return;
    const fee = loggedInUser.isFeeExempt ? 0 : amount * 0.055;
    const netReceived = amount - fee;
    const description = `Crypto Withdrawal to ${details.cryptoAddress?.substring(0, 10)}...`;
    const withdrawalDetailsWithFee: Transaction['withdrawalDetails'] = { ...details, fee, netReceived };
    // FIX: Updated to pass status within the transaction object.
    await addTransaction({ description, amount: -amount, type: TransactionType.WITHDRAWAL, withdrawalDetails: withdrawalDetailsWithFee, status: 'Awaiting Confirmation' });
  };

  const approveWithdrawal = async (transactionId: string) => {
    if(!data) return;
    const txIndex = data.transactions.findIndex(t => t.id === transactionId);
    if(txIndex === -1) return;
    const tx = data.transactions[txIndex];
    
    const userIndex = data.users.findIndex(u => u.id === tx.userId);
    if(userIndex === -1) return;
    const user = data.users[userIndex];
    
    let updatedTx, updatedUser, updatedCollector, feeTx;
    const fee = tx.withdrawalDetails?.fee;
    const feeCollector = data.users.find(u => u.email === FEE_COLLECTOR_EMAIL);

    if (user.balance < Math.abs(tx.amount)) {
        updatedTx = { ...tx, status: 'Failed' as const, description: 'Withdrawal Failed: Insufficient Funds' };
        await api.updateTransaction(updatedTx);
    } else {
        updatedUser = { ...user, balance: user.balance + tx.amount };
        updatedTx = { ...tx, status: 'Completed' as const };
        
        if (fee && fee > 0 && feeCollector) {
            updatedCollector = { ...feeCollector, balance: feeCollector.balance + fee };
            await api.updateUser(updatedCollector);
            feeTx = await api.addTransaction(feeCollector.id, {
                description: `Withdrawal fee from ${user.name}`,
                amount: fee,
                type: TransactionType.ADMIN_ADJUSTMENT,
                status: 'Completed'
            });
        }
        
        await api.updateUser(updatedUser);
        await api.updateTransaction(updatedTx);
        await addAuditLog('APPROVE_WITHDRAWAL', `Approved withdrawal for ${user.name}`, user.id);
    }

    setData(prev => {
        if (!prev) return null;
        const newTxs = [...prev.transactions];
        newTxs[txIndex] = updatedTx!;
        if (feeTx) newTxs.unshift(feeTx);
        
        const newUsers = prev.users.map(u => {
            if (updatedUser && u.id === updatedUser.id) return updatedUser;
            if (updatedCollector && u.id === updatedCollector.id) return updatedCollector;
            return u;
        });
        return { ...prev, users: newUsers, transactions: newTxs };
    });
  };

  const rejectWithdrawal = async (transactionId: string) => {
     const tx = data?.transactions.find(t => t.id === transactionId);
     if (!tx) return;
     const updatedTx = { ...tx, status: 'Failed' as const };
     await api.updateTransaction(updatedTx);
     setData(prev => prev ? ({ ...prev, transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t) }) : null);
     await addAuditLog('REJECT_WITHDRAWAL', `Rejected withdrawal for user ID ${tx.userId}`, tx.userId);
  };
  
  const fileDispute = async (transactionId: string, reason: string, details: string): Promise<boolean> => {
    if(!data) return false;
    const tx = data.transactions.find(t => t.id === transactionId);
    if (!tx || !tx.recipientId) return false;
    const recipient = data.users.find(u => u.id === tx.recipientId);
    const disputedAmount = Math.abs(tx.amount);
    if (!recipient || recipient.balance < disputedAmount) return false;
    
    const updatedRecipient = { ...recipient, balance: recipient.balance - disputedAmount, onHoldBalance: recipient.onHoldBalance + disputedAmount };
    const updatedTx = { ...tx, dispute: { reason, details, status: 'Open' as const } };
    
    await api.updateUser(updatedRecipient);
    await api.updateTransaction(updatedTx);

    setData(prev => prev ? ({
        ...prev,
        users: prev.users.map(u => u.id === updatedRecipient.id ? updatedRecipient : u),
        transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t)
    }) : null);
    
    return true;
  };

  const refundDispute = async (transactionId: string) => {
    if(!data) return;
    const tx = data.transactions.find(t => t.id === transactionId);
    if (!tx || !tx.recipientId || !tx.dispute || tx.dispute.status !== 'Open') return;
    
    const sender = data.users.find(u => u.id === tx.userId);
    const recipient = data.users.find(u => u.id === tx.recipientId);
    if (!sender || !recipient) return;

    const disputedAmount = Math.abs(tx.amount);
    const updatedRecipient = { ...recipient, onHoldBalance: recipient.onHoldBalance - disputedAmount };
    const updatedSender = { ...sender, balance: sender.balance + disputedAmount };
    const updatedTx = { ...tx, dispute: { ...tx.dispute!, status: 'Refunded' as const }};
    
    await api.updateUser(updatedRecipient);
    await api.updateUser(updatedSender);
    await api.updateTransaction(updatedTx);

    setData(prev => prev ? ({
        ...prev,
        users: prev.users.map(u => u.id === updatedSender.id ? updatedSender : u.id === updatedRecipient.id ? updatedRecipient : u),
        transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t)
    }) : null);
  };

  const escalateDispute = async (transactionId: string) => {
      const tx = data?.transactions.find(t => t.id === transactionId);
      if (tx && tx.dispute) {
          const updatedTx = { ...tx, dispute: { ...tx.dispute, status: 'Escalated' as const } };
          await api.updateTransaction(updatedTx);
          setData(prev => prev ? ({ ...prev, transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t) }) : null);
      }
  };

  const resolveDispute = async (transactionId: string, winnerId: string) => {
    if(!data) return;
    const tx = data.transactions.find(t => t.id === transactionId);
    if (!tx || !tx.dispute || tx.dispute.status !== 'Escalated') return;

    const recipient = data.users.find(u => u.id === tx.recipientId);
    const disputedAmount = Math.abs(tx.amount);
    if (!recipient || recipient.onHoldBalance < disputedAmount) return;

    let updatedSender: User | undefined;
    const updatedRecipient = { ...recipient, onHoldBalance: recipient.onHoldBalance - disputedAmount };

    if (winnerId === tx.userId) { 
        const sender = data.users.find(u => u.id === tx.userId); 
        if (sender) updatedSender = { ...sender, balance: sender.balance + disputedAmount };
    } else { 
        updatedRecipient.balance += disputedAmount; 
    }
    
    if (updatedSender) await api.updateUser(updatedSender);
    await api.updateUser(updatedRecipient);
    
    const updatedTx = { ...tx, dispute: { ...tx.dispute!, status: 'Resolved' as const }};
    await api.updateTransaction(updatedTx);
    
    setData(prev => {
        if (!prev) return null;
        return {
            ...prev,
            users: prev.users.map(u => {
                if (updatedSender && u.id === updatedSender.id) return updatedSender;
                if (u.id === updatedRecipient.id) return updatedRecipient;
                return u;
            }),
            transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t)
        }
    });

    const winner = data.users.find(u => u.id === winnerId);
    if (winner) await addAuditLog('RESOLVE_DISPUTE', `Resolved dispute in favor of ${winner.name}`, winner.id);
  };

  const createVaultVoucher = async (amount: number): Promise<string | null> => {
    if (!loggedInUser || loggedInUser.balance < amount || amount <= 0) return null;
    const updatedUser = { ...loggedInUser, balance: loggedInUser.balance - amount };
    // FIX: api.addTransaction expects status to be part of the transaction object.
    const newTx = await api.addTransaction(loggedInUser.id, { description: 'Voucher Creation', amount: -amount, type: TransactionType.VAULT_VOUCHER_CREATE, status: 'Pending' });
    
    await updateUser(updatedUser);
    setData(prev => prev ? ({ ...prev, transactions: [newTx, ...prev.transactions] }) : null);
    
    return newTx.vaultVoucherCode || null;
  };

  const checkVaultVoucher = (code: string) => api.getTransactionByVoucher(code);

  const redeemVaultVoucher = async (code: string): Promise<string | boolean> => {
      if (!loggedInUser || !data?.users) return false;
      const voucherTx = await checkVaultVoucher(code);
      if (!voucherTx) return 'invalidOrClaimedVoucher';
      if (voucherTx.userId === loggedInUser.id) return 'cannotRedeemOwnVoucher';
      
      const amount = Math.abs(voucherTx.amount);
      const updatedUser = { ...loggedInUser, balance: loggedInUser.balance + amount };
      const updatedVoucherTx = { ...voucherTx, status: 'Completed' as const, recipientId: loggedInUser.id };
      // FIX: Added missing status property to the transaction object.
      const redemptionTx = await adminAddTransaction(loggedInUser.id, { description: `Voucher Redeemed from ${data.users.find(u=>u.id === voucherTx.userId)?.name || 'Unknown'}`, amount: amount, type: TransactionType.VAULT_VOUCHER_REDEEM, referenceCode: code, status: 'Completed' });

      await updateUser(updatedUser);
      await api.updateTransaction(updatedVoucherTx);
      
      setData(prev => prev ? ({ ...prev, transactions: prev.transactions.map(t => t.id === voucherTx.id ? updatedVoucherTx : t) }) : null);
      
      return true;
  };

  const cancelVaultVoucher = async (transactionId: string) => {
      if(!loggedInUser || !data) return;
      const tx = data.transactions.find(t => t.id === transactionId);
      if (!tx || tx.userId !== loggedInUser.id || tx.status !== 'Pending' || tx.type !== TransactionType.VAULT_VOUCHER_CREATE) return;
      
      const amountToRefund = Math.abs(tx.amount);
      const updatedUser = { ...loggedInUser, balance: loggedInUser.balance + amountToRefund };
      const updatedTx = { ...tx, status: 'Failed' as const };

      await updateUser(updatedUser);
      await api.updateTransaction(updatedTx);
      setData(prev => prev ? ({ ...prev, transactions: prev.transactions.map(t => t.id === transactionId ? updatedTx : t) }) : null);
  };

  const submitKycDocuments = async (documents: { [key: string]: string }) => {
    if (!loggedInUser) return;
    await updateUser({ ...loggedInUser, kycDocuments: documents, status: UserStatus.PENDING, kycRejectionReason: undefined });
  };

  const approveKyc = async (userId: string) => {
    if(!data) return;
    const user = data.users.find(u => u.id === userId);
    if (!user || user.status !== UserStatus.PENDING) return;
    const updatedUser = { ...user, status: UserStatus.VERIFIED as const, balance: user.balance + 10, welcomeBonus: 10 };
    await api.updateUser(updatedUser);
    // FIX: Added missing status property to the transaction object.
    const bonusTx = await adminAddTransaction(userId, { description: 'Welcome Bonus', amount: 10, type: TransactionType.BONUS, status: 'Completed' });
    
    setData(prev => prev ? ({ ...prev, users: prev.users.map(u => u.id === userId ? updatedUser : u)}) : null);
    await addAuditLog('APPROVE_KYC', `Approved KYC for ${user.name}`, user.id);
  };

  const rejectKyc = async (userId: string, reason: string) => {
    if(!data) return;
    const user = data.users.find(u => u.id === userId);
    if (!user || user.status !== UserStatus.PENDING) return;
    const updatedUser = { ...user, status: UserStatus.REJECTED as const, kycRejectionReason: reason };
    await api.updateUser(updatedUser);
    setData(prev => prev ? ({ ...prev, users: prev.users.map(u => u.id === userId ? updatedUser : u)}) : null);
    await addAuditLog('REJECT_KYC', `Rejected KYC for ${user.name}. Reason: ${reason}`, user.id);
  };
    
    const updatePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
        if (!loggedInUser || loggedInUser.password !== oldPass) return false;
        await updateUser({ ...loggedInUser, password: newPass });
        return true;
    };
    
  // --- Copy Trading Logic ---
  const handleSubscribeToTrader = async (traderId: string, amount: number, settings: SubscriptionSettings) => {
    if (!loggedInUser || !data?.copyTraders) return false;
    const trader = data.copyTraders.find(t => t.id === traderId);
    if (!trader || amount < 100 || amount > loggedInUser.balance) return false;
    
    const newSubscription = await api.addSubscription({ id: '', traderId, userId: loggedInUser.id, subscribedAt: new Date().toISOString(), investedAmount: amount, currentValue: amount, pnl: 0, isActive: true, settings });
    const updatedUser = { ...loggedInUser, balance: loggedInUser.balance - amount };
    // FIX: Added missing status property to the transaction object.
    const subTx = await addTransaction({ description: `Subscribed to ${trader.name}`, amount: -amount, type: TransactionType.COPY_TRADE_SUBSCRIBE, status: 'Completed' });

    await updateUser(updatedUser);
    setData(prev => prev ? ({ ...prev, subscriptions: [newSubscription, ...prev.subscriptions] }) : null);

    return true;
  };

  const handleUnsubscribe = async (subscriptionId: string) => {
    if (!loggedInUser || !data) return false;
    const sub = data.subscriptions.find(s => s.id === subscriptionId);
    if (!sub) return false;
    const trader = data.copyTraders.find(t => t.id === sub.traderId);
    if (!trader) return false;

    let finalReturnValue = sub.currentValue;
    let penalty = 0;
    
    // Penalty Logic: 16.50% of invested amount if unsubscribed within 7 days
    if (!loggedInUser.isFeeExempt && new Date().getTime() - new Date(sub.subscribedAt).getTime() < 7 * 24 * 60 * 60 * 1000) { 
        penalty = sub.investedAmount * 0.165; 
        finalReturnValue -= penalty; 
    }

    const updatedUser = { ...loggedInUser, balance: loggedInUser.balance + finalReturnValue };
    const updatedSub = { ...sub, isActive: false, pnl: sub.currentValue - sub.investedAmount, unsubscribedAt: new Date().toISOString() };
    
    await updateUser(updatedUser);
    await api.updateSubscription(updatedSub);
    // FIX: Added missing status property to the transaction object.
    await addTransaction({ description: `Unsubscribed from ${trader.name}`, amount: finalReturnValue, type: TransactionType.COPY_TRADE_UNSUBSCRIBE, status: 'Completed' });
    
    if (penalty > 0) {
        // FIX: Added missing status property to the transaction object.
        await addTransaction({ description: 'Early Copy Trading Unsubscribe Penalty', amount: -penalty, type: TransactionType.PENALTY_FEE, status: 'Completed' });
        const feeCollector = data.users.find(u => u.email === FEE_COLLECTOR_EMAIL);
        if (feeCollector) {
            const updatedCollector = { ...feeCollector, balance: feeCollector.balance + penalty };
            await updateUser(updatedCollector);
            // FIX: Added missing status property to the transaction object.
            await adminAddTransaction(feeCollector.id, { description: `Penalty fee from ${loggedInUser.name}`, amount: penalty, type: TransactionType.ADMIN_ADJUSTMENT, status: 'Completed' });
        }
    }
    
    setData(prev => prev ? ({ ...prev, subscriptions: prev.subscriptions.map(s => s.id === subscriptionId ? updatedSub : s) }) : null);

    return true;
  };
  
  const handleUpdateSubscriptionSettings = async (subscriptionId: string, newSettings: SubscriptionSettings) => {
      const sub = data?.subscriptions.find(s => s.id === subscriptionId);
      if(!sub) return false;
      const updatedSub = { ...sub, settings: newSettings };
      await api.updateSubscription(updatedSub);
      setData(prev => prev ? ({ ...prev, subscriptions: prev.subscriptions.map(s => s.id === subscriptionId ? updatedSub : s) }) : null);
      return true;
  };

  const handleAddReview = async (traderId: string, rating: number, comment: string) => {
    if (!loggedInUser) return;
    const newReview: Review = { id: `review_${Date.now()}`, reviewerName: loggedInUser.name, rating, comment, date: new Date().toISOString() };
    await api.addReviewToTrader(traderId, newReview);
    // Refetching is complex here, will let it be slightly stale for now or do a full refetch.
    await refetchData();
  };
  
  const distributeCopyTradingProfits = async (subscriptionIds: string[], percentage: number) => {
    if (percentage <= 0 || !data) return;
    // This is a bulk operation, it's safer and easier to refetch data after it completes.
    const profitRate = percentage / 100;
    
    for (const subId of subscriptionIds) {
        const sub = data.subscriptions.find(s => s.id === subId);
        if (!sub || !sub.isActive) continue;
        const user = data.users.find(u => u.id === sub.userId);
        if (!user) continue;
        
        const profitAmount = sub.investedAmount * profitRate;
        await api.updateUser({ ...user, balance: user.balance + profitAmount });
        await api.addTransaction(sub.userId, { description: `Copy Trading Profit`, amount: profitAmount, type: TransactionType.COPY_TRADING_PROFIT, status: 'Completed' });
    }
    await addAuditLog('DISTRIBUTE_PROFIT', `Distributed ${percentage}% copy trading profit to ${subscriptionIds.length} user(s).`);
    await refetchData(); // Justified here due to bulk updates.
  };

  const handleExecuteTrade = async (assetId: string, quantity: number, price: number, type: 'BUY' | 'SELL'): Promise<{ success: boolean, error?: string }> => {
    if (!loggedInUser) return { success: false, error: 'userNotFound' };
    const result = await api.executeTrade(loggedInUser.id, assetId, quantity, price, type);
    if (result.success) {
        await refetchData(); // Refetch to update balance and portfolio everywhere
    }
    return result;
  };
  
  const appContextValue = {
    user: loggedInUser, data, isLoading, login, logout, signUp, verifyOTP, updateUser, updatePassword, addTransaction, handleDepositRequest, approveDeposit, rejectDeposit, approveInvestmentWithdrawal, rejectInvestmentWithdrawal, fileDispute, refundDispute, escalateDispute, resolveDispute, handleWithdrawalRequest, approveWithdrawal, rejectWithdrawal, createVaultVoucher, checkVaultVoucher, redeemVaultVoucher, cancelVaultVoucher, submitKycDocuments, approveKyc, rejectKyc,
    handleSubscribeToTrader, handleUnsubscribe, handleUpdateSubscriptionSettings, handleAddReview, distributeCopyTradingProfits, addAuditLog, adminAddTransaction,
    handleExecuteTrade,
    refetchData,
    areProfitsWithdrawable,
    toggleProfitWithdrawal,
  };

  // Check for reset password token in URL
  const getResetTokenFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token');
    }
    return null;
  };

  const renderContent = () => {
    // Check if user is accessing reset password link
    const resetToken = getResetTokenFromUrl();
    if (resetToken) {
      // Show reset password page even if logged in (user might be resetting while logged in)
      return (
        <AuthPage resetToken={resetToken} />
      );
    }

    if (isLoading && !data) return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
    if (!loggedInUser) return <AuthPage />;

    if (!data) {
        return <div className="flex justify-center items-center h-screen"><div>Could not load data. Please try again later.</div></div>;
    }

    if (loggedInUser.role === UserRole.OWNER || loggedInUser.role === UserRole.ADMIN) return <AdminDashboardPage />;
    return <DashboardPage />;
  };

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContext.Provider value={appContextValue}>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {renderContent()}
          </div>
        </AppContext.Provider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;