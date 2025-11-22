

import React from 'react';

// FIX: Add types for agent profit configuration
export interface AgentLevel {
  level: number;
  referralsNeeded: number;
  profitRate: number;
  label: string;
}

export interface AgentProfitConfig {
  teamCapitalBonusRate: number;
  levels: AgentLevel[];
}

export interface UserNotification {
    id: string;
    userId: string;
    timestamp: string;
    messageKey: string; // for i18n
    messageParams?: Record<string, string | number> | string; // for interpolation (can be object or JSON string from DB)
    type: 'success' | 'info' | 'warning' | 'error' | 'admin';
    isRead: boolean;
    link?: string;
}

// FIX: Moved AppDataType here from App.tsx to be accessible across the app.
export type AppDataType = {
  users: User[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  copyTraders: CopyTrader[];
  auditLogs: AuditLog[];
  assets: CryptoAsset[];
  // FIX: Add properties to match backend API response
  investmentPlans: InvestmentPlan[];
  agentProfitConfig: AgentProfitConfig;
  notifications: UserNotification[];
}

export interface KpiData {
    totalUsers: number;
    totalPlatformBalance: number;
    totalMainBalances: number;
    totalInvestedBalances: number;
    totalOnHoldBalances: number;
    sessionsActiveNow: number;
    pendingDeposits: number;
    pendingWithdrawals: number;
    openDisputes: number;
    kycPending: number;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export enum UserStatus {
  VERIFIED = 'Verified',
  UNVERIFIED = 'Unverified',
  PENDING = 'Pending',
  REJECTED = 'Rejected'
}

export type KycDocumentType = 'id_front' | 'id_back' | 'license_front' | 'license_back' | 'passport' | 'address_proof';

export interface InvestmentPlan {
  id: string;
  nameKey: string; // For translation
  minInvestment: number;
  dailyProfitRate: number;
}

export interface UserPortfolioItem {
    assetId: string;
    quantity: number;
    averageBuyPrice: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  onHoldBalance: number; // For disputed funds
  invested: number;
  welcomeBonus: number;
  createdAt: string;
  walletAddress: string;
  accountNumber: string;
  country?: string; 
  address?: string;
  lastActive?: string;
  isFrozen?: boolean;
  isBanned?: boolean;
  permissions?: {
    canManageUsers?: boolean;
    canAdjustBalance?: boolean;
    canApproveKyc?: boolean;
  };
  // New fields for referral system
  referralCode: string;
  referredBy?: string; // The referral code of the user who referred them
  referrals: { userId: string; status: 'registered' | 'funded' }[];
  isAgent: boolean;
  referralBonus: number;
  totalDeposits: number;
  depositBonusUsed: boolean;
  // New fields for investment plans
  activePlanId: string | null;
  agentLevel: number; // 0: not agent, 1: base agent, 2: 50+ refs, 3: 100+ refs
  lastRewardDate?: string; // For monthly random rewards
  unclaimedProfit: number;
  // KYC Fields
  kycDocuments?: Partial<Record<KycDocumentType, string>>; // base64 images
  kycRejectionReason?: string;
  // FIX: Added portfolio to track user's asset holdings
  portfolio: UserPortfolioItem[];
  // Password Reset Fields
  passwordResetCode?: string;
  passwordResetCodeExpires?: string;
  investmentStartDate?: string;
  isFeeExempt?: boolean;
  notification?: {
    type: 'freeze' | 'ban';
    reason: string;
    timestamp: number;
  };
}

export interface AddUserParams {
    fullName: string;
    username: string;
    email: string;
    password: string;
}

export interface AddAdminParams {
    fullName: string;
    email: string;
    password?: string;
    permissions: User['permissions'];
}


export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  INVESTMENT = 'Investment',
  INVESTMENT_WITHDRAWAL = 'Investment Withdrawal',
  INVESTMENT_WITHDRAWAL_REQUEST = 'Investment Withdrawal Request',
  PROFIT = 'Profit',
  BUY = 'Buy',
  SELL = 'Sell',
  BONUS = 'Bonus',
  INTERNAL_TRANSFER = 'Internal Transfer',
  EXTERNAL_TRANSFER = 'External Transfer',
  ADMIN_ADJUSTMENT = 'Admin Adjustment',
  REFERRAL_BONUS = 'Referral Bonus',
  COPY_TRADE_SUBSCRIBE = 'Copy Trade Subscribe',
  COPY_TRADE_UNSUBSCRIBE = 'Copy Trade Unsubscribe',
  PENALTY_FEE = 'Penalty Fee',
  COPY_TRADING_PROFIT = 'Copy Trading Profit',
  // FIX: Add missing transaction types for voucher functionality
  VAULT_VOUCHER_CREATE = 'Vault Voucher Create',
  VAULT_VOUCHER_REDEEM = 'Vault Voucher Redeem',
}

export interface Transaction {
  id: string;
  userId: string;
  recipientId?: string; // For internal transfers
  date: string;
  description: string;
  amount: number;
  originalAmount?: number;
  originalCurrency?: string;
  type: TransactionType;
  status: 'Completed' | 'Pending' | 'Failed' | 'Awaiting Confirmation';
  adminId?: string; // For tracking admin adjustments
  referenceCode?: string;
  proofImageUrl?: string; // base64 encoded image
  dispute?: {
    reason: string;
    details: string;
    status: 'Open' | 'Resolved' | 'Rejected' | 'Escalated' | 'Refunded';
  };
  withdrawalDetails?: {
    method: 'bank' | 'crypto';
    recipientName?: string;
    iban?: string;
    cryptoAddress?: string;
    cryptoNetwork?: string;
    exchangeRate?: number;
    finalAmount?: number;
    finalCurrency?: string;
    fee?: number;
    netReceived?: number;
  };
  depositDetails?: {
    whatsappNumber?: string;
  };
  // Details for Buy/Sell transactions
  assetId?: string;
  assetQuantity?: number;
  assetPrice?: number;
}

export interface CryptoAsset {
    id: string;
    name: string;
    symbol: string;
    price: number; // Mid-price
    bid: number; // Sell price
    ask: number; // Buy price
    change24h: number;
    icon: string;
    tradingViewSymbol: string;
    category: 'Crypto' | 'Forex' | 'Commodities' | 'Stocks';
    priceHistory24h?: { time: number; value: number }[];
    priceHistory1w?: { time: string; value: number }[];
    priceHistory1m?: { time: string; value: number }[];
    priceHistory1y?: { time: string; value: number }[];
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

// Represents a master trader that users can copy
export interface CopyTrader {
  id: string;
  name: string;
  avatar: string; // URL or identifier for an icon component
  riskLevel: 'Low' | 'Medium' | 'High';
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  followers: number;
  strategyDescription: string;
  winRate: number;
  openTrades: number;
  performanceHistory: { month: string; profit: number }[];
  profitShare: number;
  // New fields for detail view
  aum: number; // Assets Under Management
  rating: number; // 1-5 stars
  avgHoldingTime: string; // e.g., "4 hours", "2 days"
  avgDailyTrades: number;
  tradeHistory: {
    assetSymbol: string;
    pnl: number; // profit/loss percentage
    closeDate: string;
    type: 'BUY' | 'SELL';
  }[];
  reviews: Review[];
}

export interface SubscriptionSettings {
    copyRatio: number; // in percent
    maxLot: number;
    maxDailyTrades: number;
    globalStopLoss: number; // in percent
    dailyTarget: number; // in percent
    autoCopy: boolean;
}

// Represents a user's subscription to a copy trader
export interface Subscription {
  id: string;
  traderId: string;
  userId: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  investedAmount: number;
  currentValue: number; // For simulating PNL
  pnl: number;
  isActive: boolean;
  settings: SubscriptionSettings;
}


export interface Position {
  id: string;
  asset: CryptoAsset;
  amount: number;
  entryPrice: number;
  type: 'BUY' | 'SELL';
  takeProfit?: number;
  stopLoss?: number;
}

export interface ClosedPosition extends Position {
  exitPrice: number;
  closeDate: string;
  pnl: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    adminId: string;
    action: string;
    targetUserId?: string;
    details: string;
}