import React, { useState, useMemo, useCallback, useEffect, Suspense, lazy, useRef } from 'react';
import { User, UserRole, Transaction, AddUserParams, TransactionType, UserStatus, Subscription, Review, SubscriptionSettings, AuditLog, UserNotification } from './types';
import * as api from './services/api';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SEO } from './components/SEO';
import { StructuredData, getOrganizationSchema, getWebSiteSchema } from './components/StructuredData';
import { useSoundNotification } from './hooks/useSoundNotification';

// Lazy load pages for code splitting
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// AppDataType is now fetched, so we can get it from the data object.
// For context type, we can use the fetched data type.
import { AppDataType } from './types';

export const AppContext = React.createContext<{
  user: User | null;
  data: AppDataType | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signUp: (params: AddUserParams, referralCode?: string) => Promise<User | string>;
  updateUser: (user: User) => Promise<void>;
  updatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => Promise<Transaction | void>;
  adminAddTransaction: (userId: string, transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => Promise<Transaction | void>;
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
  addNotification: (notificationData: Omit<UserNotification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  clearReadNotifications: () => Promise<void>;
  markSingleNotificationAsRead: (notificationId: string, isRead: boolean) => Promise<void>;
  deleteSingleNotification: (notificationId: string) => Promise<void>;
  createVaultVoucher: (amount: number) => Promise<string | null>;
  checkVaultVoucher: (code: string) => Promise<Transaction | null>;
  redeemVaultVoucher: (code: string) => Promise<boolean | string>;
  cancelVaultVoucher: (transactionId: string) => Promise<void>;
} | null>(null);


const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [data, setData] = useState<AppDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authAction, setAuthAction] = useState<'login' | 'signup' | null>(null);
  const [areProfitsWithdrawable, setAreProfitsWithdrawable] = useState(() => localStorage.getItem('profits_withdrawable') === 'true');
  const [, setDataRefreshKey] = useState(0); // Force re-render trigger (unused but triggers re-render)
  const realtimeVersionRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const fallbackIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

    const refetchData = useCallback(async () => {
        try {
            // Add cache-busting timestamp to ensure fresh data
            const timestamp = Date.now();
            const allData = await api.getAllData();
            console.log('[RefetchData] Fetched data at', new Date().toISOString(), 'Transactions count:', allData.transactions?.length);
            
            // Create deep copy with new array references to ensure React detects changes
            const newData = {
                ...allData,
                users: allData.users.map(u => ({ ...u })),
                transactions: allData.transactions.map(tx => ({ ...tx })),
                subscriptions: allData.subscriptions.map(s => ({ ...s })),
                copyTraders: allData.copyTraders.map(ct => ({ ...ct })),
                auditLogs: allData.auditLogs.map(al => ({ ...al })),
                assets: allData.assets.map(a => ({ ...a })),
                notifications: allData.notifications.map(n => ({ ...n })),
                investmentPlans: [...allData.investmentPlans]
            };
            
            console.log('[RefetchData] Setting new data, transaction IDs:', newData.transactions.slice(0, 5).map(tx => tx.id));
            setData(newData);
            // Force re-render by updating refresh key
            setDataRefreshKey(prev => prev + 1);
            
            if (loggedInUser) {
                const updatedUser = allData.users.find(u => u.id === loggedInUser.id);
                if (updatedUser) {
                    // Create new object reference to ensure React detects the change
                    setLoggedInUser({ ...updatedUser });
                    console.log('[RefetchData] Updated user balance:', updatedUser.balance);
                } else {
                    logout();
                }
            }
        } catch (error) {
            console.error("Failed to refetch data:", error);
        }
    }, [loggedInUser]);

    useEffect(() => {
        const loadApp = async () => {
            setIsLoading(true);
            try {
                const allData = await api.getAllData();
                setData(allData);
                const loggedInUserId = localStorage.getItem('loggedInUserId');
                if (loggedInUserId) {
                    const user = allData.users.find(u => u.id === loggedInUserId);
                    if (user) {
                        setLoggedInUser(user);
                    } else {
                        localStorage.removeItem('loggedInUserId');
                    }
                }
            } catch (error: any) {
                console.error("Failed to load app data:", error);
                // Check if it's a network error or server error
                if (error.message && error.message.includes('non-JSON')) {
                    console.error("Backend may not be running or returning HTML instead of JSON");
                    console.error("Please ensure the backend server is running on port 3001");
                }
                // Set empty data structure to prevent app crash
                setData({
                    users: [],
                    transactions: [],
                    subscriptions: [],
                    copyTraders: [],
                    auditLogs: [],
                    assets: [],
                    notifications: [],
                    investmentPlans: [],
                    agentProfitConfig: { teamCapitalBonusRate: 0, levels: [] }
                });
            }
            setIsLoading(false);
        };
        loadApp();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const connectWebSocket = () => {
            // Fallback to polling if WebSocket is not available
            if (typeof window.WebSocket === 'undefined') {
                console.warn('[WebSocket] WebSocket not supported, falling back to polling');
                if (fallbackIntervalRef.current == null) {
                    fallbackIntervalRef.current = window.setInterval(() => {
                        refetchData();
                    }, 15000);
                }
                return;
            }

            // Clear fallback polling if WebSocket is available
            if (fallbackIntervalRef.current !== null) {
                window.clearInterval(fallbackIntervalRef.current);
                fallbackIntervalRef.current = null;
            }

            // Determine WebSocket URL
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';
            const wsUrl = `${protocol}//${host}${port}/api/ws`;

            console.log('[WebSocket] Connecting to:', wsUrl);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WebSocket] Connected');
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    // Handle heartbeat
                    if (message.type === 'heartbeat' || message.type === 'pong') {
                        return;
                    }

                    // Handle data updates
                    if (message.event && typeof message.version === 'number') {
                        if (message.version !== realtimeVersionRef.current) {
                            realtimeVersionRef.current = message.version;
                            console.log('[WebSocket] Data update received:', message.event);
                            refetchData();
                        }
                    }
                } catch (err) {
                    console.error('[WebSocket] Failed to parse message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
            };

            ws.onclose = (event) => {
                console.warn('[WebSocket] Connection closed', { code: event.code, reason: event.reason });
                wsRef.current = null;

                // Reconnect with exponential backoff (max 30 seconds)
                if (event.code !== 1000) { // Don't reconnect if closed normally
                    reconnectAttemptsRef.current++;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    
                    if (reconnectTimeoutRef.current !== null) {
                        window.clearTimeout(reconnectTimeoutRef.current);
                    }
                    
                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttemptsRef.current})...`);
                        connectWebSocket();
                    }, delay);
                }
            };

            // Send ping every 25 seconds to keep connection alive
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                } else {
                    clearInterval(pingInterval);
                }
            }, 25000);

            ws.addEventListener('close', () => {
                clearInterval(pingInterval);
            });
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }
            if (fallbackIntervalRef.current !== null) {
                window.clearInterval(fallbackIntervalRef.current);
                fallbackIntervalRef.current = null;
            }
            if (reconnectTimeoutRef.current !== null) {
                window.clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };
    }, [refetchData]);

    const login = useCallback(async (identifier: string, pass: string): Promise<boolean> => {
        const user = await api.login(identifier, pass);
        if (user) {
            setLoggedInUser(user);
            localStorage.setItem('loggedInUserId', user.id);
            await refetchData();
            return true;
        }
        return false;
    }, [refetchData]);

    const logout = useCallback(() => {
        setLoggedInUser(null);
        localStorage.removeItem('loggedInUserId');
    }, []);

    const signUp = useCallback(async (params: AddUserParams, referralCode?: string): Promise<User | string> => {
        const result = await api.signUp(params, referralCode);
        if (typeof result !== 'string' && 'error' in result) {
            return result.error;
        }
        
        const loginSuccess = await login(params.email, params.password);
        if (!loginSuccess) {
          return "loginFailedAfterSignup";
        }
        return result as User;
    }, [login]);

    const updateUser = useCallback(async (user: User) => {
        await api.updateUser(user);
        if (loggedInUser && user.id === loggedInUser.id) {
            setLoggedInUser(user);
        }
        await refetchData();
    }, [loggedInUser, refetchData]);
    
    const updatePassword = useCallback(async (oldPass: string, newPass: string) => {
        if (!loggedInUser?.password || loggedInUser.password !== oldPass) {
            return false;
        }
        await updateUser({ ...loggedInUser, password: newPass });
        return true;
    }, [loggedInUser, updateUser]);

    // Simplified functions that call the API and refetch
    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => {
        if (!loggedInUser) return;
        const newTx = await api.addTransaction(loggedInUser.id, transaction);
        console.log('[App] Transaction added, refetching data...');
        await refetchData();
        // Force another refetch after a short delay to ensure data is fresh
        setTimeout(() => refetchData(), 300);
        return newTx;
    }, [loggedInUser, refetchData]);

    const adminAddTransaction = useCallback(async (userId: string, transaction: Omit<Transaction, 'id'|'date'|'userId'>) => {
        const newTx = await api.addTransaction(userId, transaction);
        await refetchData();
        return newTx;
    }, [refetchData]);
    
    const handleDepositRequest = useCallback(async (amount: number, referenceCode: string, proofImageUrl: string, originalAmount?: number, originalCurrency?: string) => {
        if (!loggedInUser) return;
        await addTransaction({
            description: 'Deposit Request', amount, originalAmount, originalCurrency,
            type: TransactionType.DEPOSIT, status: 'Awaiting Confirmation', referenceCode, proofImageUrl
        });
    }, [loggedInUser, addTransaction]);
    
    const approveDeposit = useCallback(async (transactionId: string) => {
        await api.approveDeposit(transactionId);
        await refetchData();
    }, [refetchData]);
    
    const rejectDeposit = useCallback(async (transactionId: string) => {
        await api.rejectDeposit(transactionId);
        await refetchData();
    }, [refetchData]);

    const approveInvestmentWithdrawal = useCallback(async (transactionId: string) => {
        await api.approveInvestmentWithdrawal(transactionId);
        await refetchData();
    }, [refetchData]);

    const rejectInvestmentWithdrawal = useCallback(async (transactionId: string) => {
        await api.rejectInvestmentWithdrawal(transactionId);
        await refetchData();
    }, [refetchData]);
    
    const fileDispute = useCallback(async (transactionId: string, reason: string, details: string) => {
        const tx = data?.transactions.find(t => t.id === transactionId);
        if(!tx) return false;
        await api.updateTransaction({ ...tx, dispute: { reason, details, status: 'Open' } });
        await refetchData();
        return true;
    }, [data, refetchData]);
    
    const refundDispute = useCallback(async (transactionId: string) => {
        const tx = data?.transactions.find(t => t.id === transactionId);
        if (tx && tx.dispute) {
            await api.updateTransaction({ ...tx, dispute: { ...tx.dispute, status: 'Refunded' } });
            await refetchData();
        }
    }, [data, refetchData]);
    
    const escalateDispute = useCallback(async (transactionId: string) => {
        const tx = data?.transactions.find(t => t.id === transactionId);
        if (tx && tx.dispute) {
            await api.updateTransaction({ ...tx, dispute: { ...tx.dispute, status: 'Escalated' } });
            await refetchData();
        }
    }, [data, refetchData]);
    
    const resolveDispute = useCallback(async (transactionId: string, winnerId: string) => {
        await api.resolveDispute(transactionId, winnerId);
        await refetchData();
    }, [refetchData]);

    const handleWithdrawalRequest = useCallback(async (amount: number, details: Transaction['withdrawalDetails']) => {
        if (!loggedInUser) return;
        await addTransaction({
            description: 'Withdrawal Request', amount: -amount, type: TransactionType.WITHDRAWAL,
            status: 'Awaiting Confirmation', withdrawalDetails: details
        });
    }, [loggedInUser, addTransaction]);
    
    const approveWithdrawal = useCallback(async (transactionId: string) => {
        await api.approveWithdrawal(transactionId);
        await refetchData();
    }, [refetchData]);

    const rejectWithdrawal = useCallback(async (transactionId: string) => {
        await api.rejectWithdrawal(transactionId);
        await refetchData();
    }, [refetchData]);
    
    const submitKycDocuments = useCallback(async (documents: { [key: string]: string }) => {
        if (!loggedInUser) {
            console.error('[KYC] User not logged in');
            throw new Error('User not logged in. Please log in and try again.');
        }
        try {
            console.log('[KYC] Submitting documents for user:', loggedInUser.id);
            await updateUser({ ...loggedInUser, kycDocuments: documents, status: UserStatus.PENDING });
            console.log('[KYC] Documents submitted successfully');
        } catch (error: any) {
            console.error('[KYC] Error submitting documents:', error);
            throw error;
        }
    }, [loggedInUser, updateUser]);

    const approveKyc = useCallback(async (userId: string) => {
        await api.approveKyc(userId);
        await refetchData();
    }, [refetchData]);
    
    const rejectKyc = useCallback(async (userId: string, reason: string) => {
        await api.rejectKyc(userId, reason);
        await refetchData();
    }, [refetchData]);
    
    const handleSubscribeToTrader = useCallback(async (traderId: string, amount: number, settings: SubscriptionSettings) => {
        if (!loggedInUser || loggedInUser.balance < amount) return false;
        await api.addSubscription({
            traderId, userId: loggedInUser.id, subscribedAt: new Date().toISOString(), investedAmount: amount, currentValue: amount,
            pnl: 0, isActive: true, settings: settings,
        });
        await refetchData();
        return true;
    }, [loggedInUser, refetchData]);

    const handleUnsubscribe = useCallback(async (subscriptionId: string) => {
        const sub = data?.subscriptions.find(s => s.id === subscriptionId);
        if (!sub) return false;
        await api.updateSubscription({ ...sub, isActive: false, unsubscribedAt: new Date().toISOString() });
        await refetchData();
        return true;
    }, [data, refetchData]);

    const handleUpdateSubscriptionSettings = useCallback(async (subscriptionId: string, newSettings: SubscriptionSettings) => {
        const sub = data?.subscriptions.find(s => s.id === subscriptionId);
        if (!sub) return false;
        await api.updateSubscription({ ...sub, settings: newSettings });
        await refetchData();
        return true;
    }, [data, refetchData]);
    
    const handleAddReview = useCallback(async (traderId: string, rating: number, comment: string) => {
        if (!loggedInUser) return;
        const newReview: Review = { id: crypto.randomUUID(), reviewerName: loggedInUser.name, rating, comment, date: new Date().toISOString() };
        await api.addReviewToTrader(traderId, newReview);
        await refetchData();
    }, [loggedInUser, refetchData]);
    
    const distributeCopyTradingProfits = useCallback(async (subscriptionIds: string[], percentage: number) => {
        await api.distributeCopyTradingProfits(subscriptionIds, percentage);
        await refetchData();
    }, [refetchData]);
    
    const handleExecuteTrade = useCallback(async (assetId: string, quantity: number, price: number, type: 'BUY' | 'SELL') => {
        if (!loggedInUser) return { success: false, error: 'User not found' };
        const result = await api.executeTrade(loggedInUser.id, assetId, quantity, price, type);
        if (result.success) {
            await refetchData();
        }
        return result;
    }, [loggedInUser, refetchData]);
    
    const addAuditLog = useCallback(async (action: string, details: string, targetUserId?: string) => {
      if (!loggedInUser) return;
      await api.addAuditLog(loggedInUser.id, action, details, targetUserId);
      await refetchData();
    }, [loggedInUser, refetchData]);

    const addNotification = useCallback(async (notificationData: Omit<UserNotification, 'id' | 'timestamp' | 'isRead'>) => {
        await api.addNotification(notificationData);
        await refetchData();
    }, [refetchData]);

    const markNotificationsAsRead = useCallback(async () => {
        if (!loggedInUser) return;
        await api.markNotificationsAsRead(loggedInUser.id);
        await refetchData();
    }, [loggedInUser, refetchData]);

    const clearReadNotifications = useCallback(async () => {
        if (!loggedInUser) return;
        await api.clearReadNotifications(loggedInUser.id);
        await refetchData();
    }, [loggedInUser, refetchData]);
    
    const markSingleNotificationAsRead = useCallback(async (notificationId: string, isRead: boolean) => {
        await api.markSingleNotificationAsRead(notificationId, isRead);
        await refetchData();
    }, [refetchData]);
    
    const deleteSingleNotification = useCallback(async (notificationId: string) => {
        await api.deleteSingleNotification(notificationId);
        await refetchData();
    }, [refetchData]);

    const createVaultVoucher = useCallback(async (amount: number) => {
        if (!loggedInUser) return null;
        const result = await api.createVaultVoucher(loggedInUser.id, amount);
        await refetchData();
        return result?.code || null;
    }, [loggedInUser, refetchData]);

    const checkVaultVoucher = api.checkVaultVoucher;

    const redeemVaultVoucher = useCallback(async (code: string) => {
        if (!loggedInUser) return "User not logged in";
        const result = await api.redeemVaultVoucher(loggedInUser.id, code);
        if (result.success) {
            await refetchData();
            return true;
        }
        return result.error || "Redemption failed";
    }, [loggedInUser, refetchData]);

    const cancelVaultVoucher = useCallback(async (transactionId: string) => {
        if (!loggedInUser) return;
        await api.cancelVaultVoucher(loggedInUser.id, transactionId);
        await refetchData();
    }, [loggedInUser, refetchData]);
    
    const toggleProfitWithdrawal = useCallback(() => {
        setAreProfitsWithdrawable(prev => {
            const newState = !prev;
            localStorage.setItem('profits_withdrawable', String(newState));
            addAuditLog('PROFIT_WITHDRAWAL_TOGGLED', `Profit withdrawal was ${newState ? 'ENABLED' : 'DISABLED'} for all users.`);
            return newState;
        });
    }, [addAuditLog]);

    // Sound notification hook - plays sound when money-related notifications arrive
    useSoundNotification({
        notifications: data?.notifications || [],
        userId: loggedInUser?.id,
        enabled: true
    });

    const contextValue = useMemo(() => ({
        user: loggedInUser, data, isLoading, login, logout, signUp, updateUser, updatePassword, addTransaction, adminAddTransaction,
        handleDepositRequest, approveDeposit, rejectDeposit, approveInvestmentWithdrawal, rejectInvestmentWithdrawal, fileDispute, refundDispute,
        escalateDispute, resolveDispute, handleWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitKycDocuments, approveKyc, rejectKyc,
        handleSubscribeToTrader, handleUnsubscribe, handleUpdateSubscriptionSettings, handleAddReview, distributeCopyTradingProfits,
        addAuditLog, handleExecuteTrade, refetchData, areProfitsWithdrawable, toggleProfitWithdrawal, addNotification, markNotificationsAsRead, clearReadNotifications,
        markSingleNotificationAsRead, deleteSingleNotification,
        createVaultVoucher, checkVaultVoucher, redeemVaultVoucher, cancelVaultVoucher,
    }), [
        loggedInUser, data, isLoading, login, logout, signUp, updateUser, updatePassword, addTransaction, adminAddTransaction,
        handleDepositRequest, approveDeposit, rejectDeposit, approveInvestmentWithdrawal, rejectInvestmentWithdrawal, fileDispute, refundDispute,
        escalateDispute, resolveDispute, handleWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitKycDocuments, approveKyc, rejectKyc,
        handleSubscribeToTrader, handleUnsubscribe, handleUpdateSubscriptionSettings, handleAddReview, distributeCopyTradingProfits,
        addAuditLog, handleExecuteTrade, refetchData, areProfitsWithdrawable, toggleProfitWithdrawal, addNotification, markNotificationsAsRead, clearReadNotifications,
        markSingleNotificationAsRead, deleteSingleNotification, createVaultVoucher, checkVaultVoucher, redeemVaultVoucher, cancelVaultVoucher
    ]);

    // Determine current page for SEO
    const currentPage = useMemo(() => {
        if (loggedInUser) {
            if (loggedInUser.role === UserRole.USER) {
                return { title: 'Dashboard', description: 'Manage your investments, trades, and portfolio on VaultChain' };
            } else {
                return { title: 'Admin Dashboard', description: 'VaultChain admin panel for managing users, transactions, and platform settings' };
            }
        } else if (authAction) {
            return { title: authAction === 'login' ? 'Login' : 'Sign Up', description: authAction === 'login' ? 'Login to your VaultChain account' : 'Create a new VaultChain account' };
        } else {
            return { title: 'VaultChain - Modern Investment & Trading Platform', description: 'VaultChain is a comprehensive FinTech platform for investment, trading, and financial management. Trade cryptocurrencies, forex, stocks, and commodities with advanced tools and expert copy trading.' };
        }
    }, [loggedInUser, authAction]);

    if (isLoading) {
        return (
            <LanguageProvider>
                <ThemeProvider>
                    <SEO title="Loading..." />
                    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
                        </div>
                    </div>
                </ThemeProvider>
            </LanguageProvider>
        );
    }

    const renderContent = () => {
        if (loggedInUser) {
            if (loggedInUser.role === UserRole.USER) {
                return (
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>}>
                        <DashboardPage />
                    </Suspense>
                );
            } else {
                return (
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>}>
                        <AdminDashboardPage />
                    </Suspense>
                );
            }
        } else if (authAction) {
            return (
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>}>
                    <AuthPage initialView={authAction} onBackToHome={() => setAuthAction(null)} />
                </Suspense>
            );
        } else {
            return (
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>}>
                    <LandingPage assets={data?.assets || []} onLogin={() => setAuthAction('login')} onSignUp={() => setAuthAction('signup')} />
                </Suspense>
            );
        }
    };

    return (
        <LanguageProvider>
            <ThemeProvider>
                <AppContext.Provider value={contextValue}>
                    <SEO 
                        title={currentPage.title}
                        description={currentPage.description}
                        keywords="VaultChain, investment platform, trading, cryptocurrency, forex, stocks, commodities, copy trading, financial management, FinTech"
                    />
                    <StructuredData data={getOrganizationSchema()} />
                    <StructuredData data={getWebSiteSchema()} />
                    {renderContent()}
                </AppContext.Provider>
            </ThemeProvider>
        </LanguageProvider>
    );
};

export default App;
