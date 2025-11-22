import { User, Transaction, AddUserParams, Subscription, AuditLog, Review, AppDataType, KpiData, SubscriptionSettings, UserNotification } from '../types';

// API Base URL - handles both web and mobile
// For mobile apps, use production API URL
// For web, use relative path /api (works on same domain)
let API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Check if running in Capacitor (mobile app)
if (typeof window !== 'undefined' && (window as any).Capacitor) {
  const { Capacitor } = (window as any).Capacitor;
  if (Capacitor.isNativePlatform()) {
    // Use production API for mobile
    API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vaultchaintr.store/api';
  }
}

const handleResponse = async (response: Response) => {
    // Read the response body as text first (we can only read it once)
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    // Read the response text once
    const text = await response.text();
    
    if (!response.ok) {
        // Error response
        if (isJson) {
            try {
                if (!text || text.trim().length === 0) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || errorData.error || `Server error: ${response.statusText}`);
            } catch (parseError: any) {
                if (parseError instanceof Error && parseError.message.includes('Server error')) {
                    throw parseError;
                }
                console.error('Failed to parse error response:', parseError);
                console.error('Response text:', text.substring(0, 200));
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
        } else {
            console.error('Non-JSON error response:', text.substring(0, 200));
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
    }
    
    // Success response
    if (!isJson) {
        console.error('Non-JSON success response received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
    }
    
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from server');
        }
        const data = JSON.parse(text);
        return data;
    } catch (parseError: any) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text (first 500 chars):', text.substring(0, 500));
        throw new Error(`Invalid JSON response from server: ${parseError.message}`);
    }
};

// --- Auth ---
export const login = (identifier: string, pass: string): Promise<User | null> => 
    fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass }),
    }).then(res => res.ok ? res.json() : null);

export const signUp = (params: AddUserParams, referralCode?: string): Promise<User | { error: string }> => 
    fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, referralCode }),
    }).then(handleResponse);

export const requestPasswordReset = (email: string): Promise<{ success: boolean; error?: string }> =>
    fetch(`${API_BASE_URL}/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    }).then(handleResponse);

export const resetPasswordWithCode = (email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> =>
    fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
    }).then(handleResponse);


// --- Data ---
export const getAllData = (): Promise<AppDataType> => {
    // Add cache-busting timestamp to ensure fresh data
    const timestamp = Date.now();
    return fetch(`${API_BASE_URL}/data?_t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    }).then(handleResponse);
};

export const getRealtimeStreamUrl = (): string => {
    // Legacy SSE endpoint (deprecated, kept for backwards compatibility)
    return `${API_BASE_URL}/data/stream`;
};

export const getWebSocketUrl = (): string => {
    // Determine WebSocket protocol based on current page protocol
    if (typeof window === 'undefined') return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${host}${port}/api/ws`;
};
export const getAdminKpis = (): Promise<KpiData> => fetch(`${API_BASE_URL}/kpis`).then(handleResponse);

// --- Users ---
export const updateUser = (updatedUser: User): Promise<User> => 
    fetch(`${API_BASE_URL}/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
    }).then(handleResponse);

export const addAdminUser = (params: any): Promise<User> =>
    fetch(`${API_BASE_URL}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    }).then(handleResponse);

// --- Transactions ---
export const addTransaction = (userId: string, transaction: Omit<Transaction, 'id' | 'date' | 'userId'>): Promise<Transaction> =>
    fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...transaction }),
    }).then(handleResponse);

export const updateTransaction = (updatedTx: Transaction): Promise<Transaction> =>
    fetch(`${API_BASE_URL}/transactions/${updatedTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTx),
    }).then(handleResponse);

export const processInternalTransfer = (senderId: string, recipientId: string, amount: number, fee: number, feeCollectorId?: string): Promise<{ success: boolean; transaction: Transaction }> =>
    fetch(`${API_BASE_URL}/transactions/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, recipientId, amount, fee, feeCollectorId }),
    }).then(handleResponse);

// --- Admin Actions ---
export const approveDeposit = (transactionId: string): Promise<void> => 
    fetch(`${API_BASE_URL}/admin/approve-deposit/${transactionId}`, { method: 'POST' }).then(handleResponse);

export const rejectDeposit = (transactionId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/reject-deposit/${transactionId}`, { method: 'POST' }).then(handleResponse);

export const approveWithdrawal = (transactionId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/approve-withdrawal/${transactionId}`, { method: 'POST' }).then(handleResponse);

export const rejectWithdrawal = (transactionId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/reject-withdrawal/${transactionId}`, { method: 'POST' }).then(handleResponse);

export const approveInvestmentWithdrawal = (transactionId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/approve-investment-withdrawal/${transactionId}`, { method: 'POST' }).then(handleResponse);

export const rejectInvestmentWithdrawal = (transactionId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/reject-investment-withdrawal/${transactionId}`, { method: 'POST' }).then(handleResponse);
    
export const approveKyc = (userId: string): Promise<void> => 
    fetch(`${API_BASE_URL}/admin/approve-kyc/${userId}`, { method: 'POST' }).then(handleResponse);

export const rejectKyc = (userId: string, reason: string): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/reject-kyc/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
    }).then(handleResponse);

export const resolveDispute = (transactionId: string, winnerId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/resolve-dispute/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId }),
    }).then(handleResponse);
    
export const distributeCopyTradingProfits = (subscriptionIds: string[], percentage: number): Promise<void> =>
    fetch(`${API_BASE_URL}/admin/distribute-profits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionIds, percentage }),
    }).then(handleResponse);


// --- User Actions ---
export const executeTrade = (userId: string, assetId: string, quantity: number, price: number, type: 'BUY' | 'SELL'): Promise<{ success: boolean; error?: string }> =>
    fetch(`${API_BASE_URL}/trade/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assetId, quantity, price, type }),
    }).then(handleResponse);

export const addReviewToTrader = (traderId: string, review: Review): Promise<void> =>
    fetch(`${API_BASE_URL}/copy-traders/${traderId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
    }).then(handleResponse);

export const addSubscription = (sub: Omit<Subscription, 'id'>): Promise<Subscription> =>
    fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
    }).then(handleResponse);

export const updateSubscription = (updatedSub: Subscription): Promise<Subscription> =>
    fetch(`${API_BASE_URL}/subscriptions/${updatedSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSub),
    }).then(handleResponse);

export const updateCopyTrader = (trader: any): Promise<void> => {
    // This seems to only be used for follower count.
    return fetch(`${API_BASE_URL}/copy-traders/${trader.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trader),
    }).then(handleResponse);
};
    
// --- Vouchers ---
export const createVaultVoucher = (userId: string, amount: number): Promise<{ code: string }> =>
    fetch(`${API_BASE_URL}/vouchers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
    }).then(handleResponse);

export const checkVaultVoucher = (code: string): Promise<Transaction | null> =>
    fetch(`${API_BASE_URL}/vouchers/check/${code}`).then(res => res.ok ? res.json() : null);

export const redeemVaultVoucher = (userId: string, code: string): Promise<{ success: boolean, error?: string }> =>
    fetch(`${API_BASE_URL}/vouchers/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
    }).then(handleResponse);

export const cancelVaultVoucher = (userId: string, transactionId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/vouchers/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, transactionId }),
    }).then(handleResponse);


// --- Audit Logs & Notifications ---
export const addAuditLog = (adminId: string, action: string, details: string, targetUserId?: string): Promise<AuditLog> =>
    fetch(`${API_BASE_URL}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, action, details, targetUserId }),
    }).then(handleResponse);

export const addNotification = (notificationData: Omit<UserNotification, 'id' | 'timestamp' | 'isRead'>): Promise<UserNotification> =>
    fetch(`${API_BASE_URL}/users/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
    }).then(handleResponse);

export const markNotificationsAsRead = (userId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/users/${userId}/notifications/mark-read`, { method: 'POST' }).then(handleResponse);

export const clearReadNotifications = (userId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/users/${userId}/notifications/clear-read`, { method: 'DELETE' }).then(handleResponse);
    
export const markSingleNotificationAsRead = (notificationId: string, isRead: boolean): Promise<void> =>
    fetch(`${API_BASE_URL}/users/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
    }).then(handleResponse);

export const deleteSingleNotification = (notificationId: string): Promise<void> =>
    fetch(`${API_BASE_URL}/users/notifications/${notificationId}`, { method: 'DELETE' }).then(handleResponse);
    

// --- AI Assistant (Streaming) ---
export const getAiAssistanceStream = async (prompt: string, portfolioSummary: string, marketSummary: string): Promise<AsyncIterable<string>> => {
    const response = await fetch(`${API_BASE_URL}/ai/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, portfolioSummary, marketSummary }),
    });

    if (!response.ok) {
        // Try to parse error response as JSON
        let errorMessage = 'Failed to get AI assistance';
        try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } else {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
        } catch (parseError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    if (!response.body) {
        throw new Error('Response body is not available');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
        async *[Symbol.asyncIterator]() {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const decoded = decoder.decode(value, { stream: true });
                    if (decoded) {
                        yield decoded;
                    }
                }
            } catch (streamError) {
                console.error('[AI] Stream reading error:', streamError);
                throw new Error('Error reading AI response stream');
            }
        },
    };
};