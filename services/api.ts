
import { User, Transaction, AddUserParams, Subscription, AuditLog, Review, AppDataType, KpiData, AddAdminParams } from '../types';

// Dynamic base: localhost in dev, relative in prod
export const API_BASE_URL = (typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1'))
  ? 'http://localhost:3001/api'
  : '/api'; // Production uses relative path - Nginx will proxy /api to backend

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const error = await response.json();
            errorMessage = error.message || error.error || errorMessage;
            // Include more details if available
            if (error.error && typeof error.error === 'string') {
                errorMessage = `${errorMessage}: ${error.error}`;
            }
        } catch (e) {
            // If response is not JSON, try to get text
            try {
                const text = await response.text();
                errorMessage = text || errorMessage;
            } catch {
                errorMessage = 'An unknown error occurred';
            }
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const { headers, ...rest } = options;
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        ...rest,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return handleResponse(response);
};


// --- API Service Functions ---

// --- Auth ---
export const login = (identifier: string, pass: string): Promise<User | null> => {
    return apiRequest<User | null>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password: pass }),
    }).catch(() => null);
};

export const signUp = (params: AddUserParams, referralCode?: string): Promise<User | { error: string }> => {
    return apiRequest<User | { error: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ ...params, referralCode }),
    }).catch(err => ({ error: err.message || 'signUpError' }));
};

export const requestPasswordReset = (identifier: string): Promise<{ success: boolean; error?: string }> => {
    return apiRequest('/auth/request-reset', { method: 'POST', body: JSON.stringify({ identifier }) });
};

export const verifyResetToken = (token: string): Promise<{ success: boolean; email?: string; error?: string }> => {
    return apiRequest(`/auth/verify-reset-token/${token}`, { method: 'GET' });
};

export const resetPasswordWithToken = (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    return apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
};

export const verifyOTP = (email: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    return apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
};

export const resendOTP = (email: string): Promise<{ success: boolean; error?: string }> => {
    return apiRequest('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
};

// --- Data Fetching ---
export const getAllData = (): Promise<AppDataType> => {
    return apiRequest<AppDataType>('/data');
};

export const getAdminKpis = async (): Promise<KpiData> => {
    try {
        return await apiRequest<KpiData>('/admin/kpis');
    } catch (error) {
        console.error('Error fetching admin KPIs:', error);
        throw error; // Re-throw to let the component handle it
    }
}

// --- Data Mutation ---
export const updateUser = (updatedUser: User): Promise<User> => {
    return apiRequest(`/users/${updatedUser.id}`, { method: 'PUT', body: JSON.stringify(updatedUser) });
};

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id' | 'date' | 'userId'>): Promise<Transaction> => {
    try {
        return await apiRequest<Transaction>(`/users/${userId}/transactions`, { 
            method: 'POST', 
            body: JSON.stringify(transaction) 
        });
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
}

export const executeTrade = (userId: string, assetId: string, quantity: number, price: number, type: 'BUY' | 'SELL'): Promise<{ success: boolean; error?: string }> => {
    return apiRequest('/trade/execute', { method: 'POST', body: JSON.stringify({ userId, assetId, quantity, price, type }) });
}


export const addAuditLog = (adminId: string, action: string, details: string, targetUserId?: string): Promise<AuditLog> => {
    return apiRequest('/audit-logs', { method: 'POST', body: JSON.stringify({ adminId, action, details, targetUserId }) });
}

export const approveDeposit = (transactionId: string): Promise<boolean> => {
    return apiRequest(`/transactions/${transactionId}/approve-deposit`, { method: 'POST' });
}

export const recalculateBalances = (): Promise<{ message: string }> => {
    return apiRequest('/admin/recalculate-balances', { method: 'POST' });
}

export const addReviewToTrader = (traderId: string, review: Review): Promise<boolean> => {
    return apiRequest(`/copy-traders/${traderId}/reviews`, { method: 'POST', body: JSON.stringify(review) });
}

export const addSubscription = (sub: Subscription): Promise<Subscription> => {
    return apiRequest('/subscriptions', { method: 'POST', body: JSON.stringify(sub) });
}

export const updateSubscription = (updatedSub: Subscription): Promise<Subscription> => {
    return apiRequest(`/subscriptions/${updatedSub.id}`, { method: 'PUT', body: JSON.stringify(updatedSub) });
}

export const getTransactionByVoucher = (code: string): Promise<Transaction | null> => {
    return apiRequest<Transaction | null>(`/vouchers/${code}`).catch(() => null);
}

export const addAdminUser = (params: AddAdminParams): Promise<User | null> => {
    return apiRequest('/admins', { method: 'POST', body: JSON.stringify(params) });
};

export const updateTransaction = (updatedTx: Transaction): Promise<Transaction> => {
    return apiRequest(`/transactions/${updatedTx.id}`, { method: 'PUT', body: JSON.stringify(updatedTx) });
}

// NOTE: Static config data like investment plans are now fetched from the backend via `getAllData`.
// The components that used to import them from here will now get them from the AppContext.