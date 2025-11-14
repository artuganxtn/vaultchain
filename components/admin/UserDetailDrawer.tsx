import React, { useState, useContext, useMemo } from 'react';
import { User, UserStatus, Transaction, TransactionType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { CloseIcon } from '../ui/Icons';
import Modal from '../ui/Modal';
import { AppContext } from '../../App';
import TransactionRow from '../ui/TransactionRow';
import { getLocaleFromLanguage, formatCurrency, formatDate, formatDateTime } from '../../utils/locale';

interface UserDetailDrawerProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => Promise<void>;
}

const Stat: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-md font-semibold text-gray-800 dark:text-gray-200">{value}</p>
  </div>
);

// New stateful component for the Balance Adjustment modal content
const BalanceAdjustModalContent: React.FC<{
    onClose: () => void;
    onConfirm: (amount: number, reason: string) => Promise<void>;
}> = ({ onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async (e?: React.MouseEvent | React.TouchEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setError('');
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount <= 0) {
            setError(t('amountRequired') || 'Please enter a valid amount.');
            return;
        }
        
        if (!reason.trim()) {
            setError(t('reasonForActionMandatory') || 'Reason is required.');
            return;
        }

        setIsProcessing(true);
        try {
            await onConfirm(numAmount, reason.trim());
            // Modal will be closed by parent on success
        } catch (err: any) {
            console.error('[BalanceAdjust] Error:', err);
            setError(err?.message || t('operationFailed') || 'Operation failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => {
                        setAmount(e.target.value);
                        setError('');
                    }} 
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    disabled={isProcessing}
                    autoFocus
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reasonForActionMandatory')}</label>
                <textarea
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        setError('');
                    }}
                    placeholder={t('reasonForAdjustment') || 'Enter reason for this action...'}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-base min-h-[100px]"
                    rows={3}
                    disabled={isProcessing}
                />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    disabled={isProcessing}
                    className="px-6 py-3 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 active:bg-gray-400 disabled:opacity-50 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                    {t('cancel')}
                </button>
                <button 
                    onClick={handleConfirm}
                    onTouchStart={handleConfirm}
                    disabled={!amount || parseFloat(amount) <= 0 || !reason.trim() || isProcessing} 
                    className="px-6 py-3 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                    {isProcessing ? t('processing') || 'Processing...' : t('confirm')}
                </button>
            </div>
        </div>
    );
};

const InvestmentAdjustModalContent: React.FC<{
    user: User;
    onClose: () => void;
    onConfirm: (type: 'invested' | 'unclaimedProfit', action: 'add' | 'deduct', amount: number, reason: string) => Promise<string | null>;
}> = ({ user, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [type, setType] = useState<'invested' | 'unclaimedProfit'>('invested');
    const [action, setAction] = useState<'add' | 'deduct'>('add');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async (e?: React.MouseEvent | React.TouchEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setError('');
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError(t('amountRequired') || 'Please enter a valid amount.');
            return;
        }
        if (!reason.trim()) {
            setError(t('reasonForActionMandatory') || 'Reason is required.');
            return;
        }

        setIsProcessing(true);
        try {
            const errorResult = await onConfirm(type, action, numAmount, reason.trim());
            if (errorResult) {
                setError(errorResult);
            } else {
                // Parent will close on success
                onClose();
            }
        } catch (err: any) {
            console.error('[InvestmentAdjust] Error:', err);
            setError(err?.message || t('operationFailed') || 'Operation failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('adjustmentType')}</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="invested">{t('investedBalance')}</option>
                        <option value="unclaimedProfit">{t('unclaimedProfit')}</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('adjustmentAction')}</label>
                    <select value={action} onChange={(e) => setAction(e.target.value as any)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="add">{t('add')}</option>
                        <option value="deduct">{t('deduct')}</option>
                    </select>
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                 <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => {
                        setAmount(e.target.value);
                        setError('');
                    }} 
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    disabled={isProcessing}
                    autoFocus
                />
            </div>
             <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reasonForActionMandatory')}</label>
                <textarea
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        setError('');
                    }}
                    placeholder={t('reasonForAdjustment') || 'Enter reason for this action...'}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-base min-h-[100px]"
                    rows={3}
                    disabled={isProcessing}
                />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    disabled={isProcessing}
                    className="px-6 py-3 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 active:bg-gray-400 disabled:opacity-50 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                    {t('cancel')}
                </button>
                <button 
                    onClick={handleConfirm}
                    onTouchStart={handleConfirm}
                    disabled={!amount || !reason.trim() || isProcessing} 
                    className="px-6 py-3 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                    {isProcessing ? t('processing') || 'Processing...' : t('confirm')}
                </button>
            </div>
        </div>
    );
};

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, onClose, onUpdateUser }) => {
  const { t, language } = useTranslation();
  const context = React.useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [reason, setReason] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null); // For future detail view
  const locale = getLocaleFromLanguage(language);

  // Always use the latest user data from context to ensure we have fresh data after refetch
  const currentUser = useMemo(() => {
    return context?.data?.users.find(u => u.id === user.id) || user;
  }, [context?.data?.users, user]);

  const userTransactions = useMemo(() => {
    if (!context?.data?.transactions) return [];
    return context.data.transactions
      .filter(tx => tx.userId === currentUser.id || tx.recipientId === currentUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [context?.data?.transactions, currentUser.id]);

  const handleBalanceAdjust = (type: 'add' | 'deduct') => {
      setModalTitle(type === 'add' ? t('addBalance') : t('deductBalance'));
      
      const confirmCallback = async (amount: number, reason: string) => {
          try {
              console.log('[BalanceAdjust] Starting...', { type, amount, userId: currentUser.id });
              
              // Get fresh user data
              const freshUser = context?.data?.users.find(u => u.id === currentUser.id) || currentUser;
              const newBalance = type === 'add' ? freshUser.balance + amount : Math.max(0, freshUser.balance - amount);
              
              const details = `${type === 'add' ? t('added', { defaultValue: 'Added' }) : t('deducted', { defaultValue: 'Deducted' })} ${formatCurrency(amount, locale)} to ${freshUser.name}. ${t('reason', { defaultValue: 'Reason' })}: ${reason || t('notSpecified', { defaultValue: 'Not specified' })}`;
              
              console.log('[BalanceAdjust] Adding audit log...');
              await context?.addAuditLog(type === 'add' ? 'ADD_BALANCE' : 'DEDUCT_BALANCE', details, freshUser.id);
              
              console.log('[BalanceAdjust] Adding transaction...');
              await context?.adminAddTransaction(freshUser.id, {
                  description: `${t('admin', { defaultValue: 'Admin' })} ${type === 'add' ? t('adjustment', { defaultValue: 'Adjustment' }) : t('deduction', { defaultValue: 'Deduction' })}. ${t('reason', { defaultValue: 'Reason' })}: ${reason || t('notAvailable', { defaultValue: 'N/A' })}`,
              amount: type === 'add' ? amount : -amount,
              type: TransactionType.ADMIN_ADJUSTMENT,
              status: 'Completed'
          });
          
              console.log('[BalanceAdjust] Updating user...');
              await onUpdateUser({ ...freshUser, balance: newBalance });
              
              console.log('[BalanceAdjust] Adding notification...');
              context?.addNotification({ userId: freshUser.id, type: 'admin', messageKey: 'notif_balance_adjusted', messageParams: { type: type === 'add' ? t('added') : t('deducted'), amount: amount, reason: reason } });
              
              console.log('[BalanceAdjust] Success!');
          setModalOpen(false);
          } catch (error: any) {
              console.error('[BalanceAdjust] Error:', error);
              throw error; // Re-throw to be handled by modal
          }
      };

      setModalContent(
        <BalanceAdjustModalContent 
            onClose={() => setModalOpen(false)}
            onConfirm={confirmCallback}
        />
      );
      setModalOpen(true);
  };
  
  const confirmActionWithReason = (title: string, message: string, onConfirm: (reason: string) => Promise<void>) => {
    setModalTitle(title);
    
    // Create a component with local state for reason
    const ReasonModalContent: React.FC = () => {
      const [localReason, setLocalReason] = useState('');
      const [error, setError] = useState('');
      const [isProcessing, setIsProcessing] = useState(false);

      const handleConfirm = async (e?: React.MouseEvent | React.TouchEvent) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        if (!localReason.trim()) {
          setError(t('reasonForActionMandatory') || 'Reason is required.');
          return;
        }

        setIsProcessing(true);
        setError('');
        try {
          await onConfirm(localReason.trim());
          setModalOpen(false);
        } catch (err: any) {
          console.error('[Action] Error:', err);
          setError(err?.message || t('operationFailed') || 'Operation failed. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };

      return (
      <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-base">{message}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reasonForActionMandatory')}</label>
        <textarea
              value={localReason}
              onChange={(e) => {
                setLocalReason(e.target.value);
                setError('');
              }}
              placeholder={t('reasonForActionMandatory') || 'Enter reason (required)...'}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-base min-h-[120px]"
              rows={4}
              disabled={isProcessing}
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setModalOpen(false);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setModalOpen(false);
              }}
              disabled={isProcessing}
              className="px-6 py-3 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 active:bg-gray-400 disabled:opacity-50 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              {t('cancel')}
            </button>
          <button 
              onClick={handleConfirm}
              onTouchStart={handleConfirm}
              disabled={!localReason.trim() || isProcessing}
              className="px-6 py-3 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              {isProcessing ? t('processing') || 'Processing...' : t('confirm')}
          </button>
        </div>
      </div>
    );
    };

    setModalContent(<ReasonModalContent />);
    setModalOpen(true);
  };

  const handleFreeze = () => confirmActionWithReason(t('freezeAccount'), t('areYouSureFreeze'), async (reasonText) => {
    try {
      console.log('[Freeze] Starting...', { userId: currentUser.id });
      const freshUser = context?.data?.users.find(u => u.id === currentUser.id) || currentUser;
      await context?.addAuditLog('FREEZE_ACCOUNT', `Account frozen. Reason: ${reasonText}`, freshUser.id);
      await context?.addNotification({ userId: freshUser.id, type: 'warning', messageKey: 'notif_account_frozen', messageParams: { reason: reasonText } });
    await onUpdateUser({ 
          ...freshUser, 
        isFrozen: true,
        notification: {
            type: 'freeze',
            reason: reasonText,
            timestamp: Date.now()
        }
    });
      console.log('[Freeze] Success!');
    } catch (error: any) {
      console.error('[Freeze] Error:', error);
      throw error;
    }
  });

  const handleUnfreeze = async () => {
    try {
      console.log('[Unfreeze] Starting...', { userId: currentUser.id });
      const freshUser = context?.data?.users.find(u => u.id === currentUser.id) || currentUser;
      await context?.addAuditLog('UNFREEZE_ACCOUNT', `Account unfrozen.`, freshUser.id);
      await context?.addNotification({ userId: freshUser.id, type: 'info', messageKey: 'notif_account_unfrozen' });
      await onUpdateUser({ ...freshUser, isFrozen: false, notification: undefined });
      console.log('[Unfreeze] Success!');
    } catch (error: any) {
      console.error('[Unfreeze] Error:', error);
      alert(error?.message || t('operationFailed') || 'Failed to unfreeze account. Please try again.');
    }
  };
  
  const handleBan = () => confirmActionWithReason(t('banAccount'), t('areYouSureBan'), async (reasonText) => {
    try {
      console.log('[Ban] Starting...', { userId: currentUser.id });
      const freshUser = context?.data?.users.find(u => u.id === currentUser.id) || currentUser;
      await context?.addAuditLog('BAN_ACCOUNT', `Account banned. Reason: ${reasonText}`, freshUser.id);
      await context?.addNotification({ userId: freshUser.id, type: 'error', messageKey: 'notif_account_banned', messageParams: { reason: reasonText } });
      await onUpdateUser({ 
          ...freshUser, 
        isBanned: true,
        notification: {
            type: 'ban',
            reason: reasonText,
            timestamp: Date.now()
        }
    });
      console.log('[Ban] Success!');
    } catch (error: any) {
      console.error('[Ban] Error:', error);
      throw error;
    }
  });

  const handleApproveKYC = async () => {
    try {
      console.log('[ApproveKYC] Starting...', { userId: currentUser.id });
      await context?.approveKyc(currentUser.id);
      console.log('[ApproveKYC] Success!');
    } catch (error: any) {
      console.error('[ApproveKYC] Error:', error);
      alert(error?.message || t('operationFailed') || 'Failed to approve KYC. Please try again.');
    }
  };
  
  const handleRejectKYC = () => {
    confirmActionWithReason(t('rejectKYC'), t('provideRejectionReason') || "Provide a reason for rejection.", async (reasonText) => {
      try {
        console.log('[RejectKYC] Starting...', { userId: currentUser.id });
      await context?.rejectKyc(currentUser.id, reasonText);
        console.log('[RejectKYC] Success!');
      } catch (error: any) {
        console.error('[RejectKYC] Error:', error);
        throw error;
      }
    });
  };

  const handleRequestDocuments = async () => {
    try {
      await context?.addNotification({ 
        userId: currentUser.id, 
        type: 'info', 
        messageKey: 'notif_kyc_documents_requested' 
      });
      alert(t('notificationSent') || `A notification has been sent to ${currentUser.name} to upload their KYC documents.`);
    } catch (error: any) {
      console.error('[RequestDocuments] Error:', error);
      alert(error?.message || t('operationFailed') || 'Failed to send notification. Please try again.');
    }
  };

  const handleToggleFeeExemption = async () => {
    try {
      console.log('[ToggleFeeExemption] Starting...', { userId: currentUser.id });
      const freshUser = context?.data?.users.find(u => u.id === currentUser.id) || currentUser;
      const isNowExempt = !freshUser.isFeeExempt;
    await context?.addAuditLog(
        isNowExempt ? 'GRANT_FEE_EXEMPTION' : 'REMOVE_FEE_EXEMPTION',
          `${isNowExempt ? 'Granted' : 'Removed'} fee exemption for ${freshUser.name}.`,
          freshUser.id
      );
      await context?.addNotification({ userId: freshUser.id, type: 'admin', messageKey: isNowExempt ? 'notif_fee_exempt_granted' : 'notif_fee_exempt_removed' });
      await onUpdateUser({ ...freshUser, isFeeExempt: isNowExempt });
      console.log('[ToggleFeeExemption] Success!');
    } catch (error: any) {
      console.error('[ToggleFeeExemption] Error:', error);
      alert(error?.message || t('operationFailed') || 'Failed to toggle fee exemption. Please try again.');
    }
  };
  
  const handleAdjustInvestment = () => {
    setModalTitle(t('adjustInvestment'));

    const confirmCallback = async (type: 'invested' | 'unclaimedProfit', action: 'add' | 'deduct', amount: number, reason: string): Promise<string | null> => {
        try {
            console.log('[AdjustInvestment] Starting...', { type, action, amount, userId: currentUser.id });
            const freshUser = context?.data?.users.find(u => u.id === currentUser.id) || currentUser;

            if (action === 'add' && type === 'invested' && freshUser.balance < amount) {
                return t('insufficientFunds') || 'Insufficient funds.';
            }
            if (action === 'deduct' && type === 'invested' && freshUser.invested < amount) {
                return t('insufficientInvestedBalance') || 'Insufficient invested balance.';
            }
            if (action === 'deduct' && type === 'unclaimedProfit' && freshUser.unclaimedProfit < amount) {
                return t('insufficientUnclaimedProfit') || 'Insufficient unclaimed profit.';
            }
            
            const updatedUser = { ...freshUser };
            let details = '';

            if (type === 'invested') {
                if (action === 'add') {
                    updatedUser.invested += amount;
                    updatedUser.balance -= amount;
                    details = `${t('admin', { defaultValue: 'Admin' })} ${t('added', { defaultValue: 'added' })} ${formatCurrency(amount, locale)} ${t('toInvestedBalance', { defaultValue: 'to invested balance' })}.`;
                } else { // deduct
                    updatedUser.invested -= amount;
                    updatedUser.balance += amount;
                    details = `${t('admin', { defaultValue: 'Admin' })} ${t('deducted', { defaultValue: 'deducted' })} ${formatCurrency(amount, locale)} ${t('fromInvestedBalance', { defaultValue: 'from invested balance' })}.`;
                }
            } else { // unclaimedProfit
                 if (action === 'add') {
                    updatedUser.unclaimedProfit += amount;
                    details = `${t('admin', { defaultValue: 'Admin' })} ${t('added', { defaultValue: 'added' })} ${formatCurrency(amount, locale)} ${t('toUnclaimedProfit', { defaultValue: 'to unclaimed profit' })}.`;
                } else { // deduct
                    updatedUser.unclaimedProfit -= amount;
                    details = `${t('admin', { defaultValue: 'Admin' })} ${t('deducted', { defaultValue: 'deducted' })} ${formatCurrency(amount, locale)} ${t('fromUnclaimedProfit', { defaultValue: 'from unclaimed profit' })}.`;
                }
            }
            
            console.log('[AdjustInvestment] Adding audit log...');
            await context?.addAuditLog('ADJUST_INVESTMENT', `${details} ${t('reason', { defaultValue: 'Reason' })}: ${reason}`, currentUser.id);
            
            console.log('[AdjustInvestment] Updating user...');
            await onUpdateUser(updatedUser);
            
            console.log('[AdjustInvestment] Adding notification...');
            context?.addNotification({ 
                userId: freshUser.id, 
                type: 'admin', 
                messageKey: 'notif_investment_adjusted', 
                messageParams: { type, action, amount: formatCurrency(amount, locale) } 
            });
            
            console.log('[AdjustInvestment] Success!');
            setModalOpen(false);
            return null; // Success
        } catch (error: any) {
            console.error('[AdjustInvestment] Error:', error);
            return error?.message || t('operationFailed') || 'Operation failed. Please try again.';
        }
    };
    
    setModalContent(<InvestmentAdjustModalContent user={currentUser} onClose={() => setModalOpen(false)} onConfirm={confirmCallback} />);
    setModalOpen(true);
};

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <div className="fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-full sm:max-w-lg bg-gray-100 dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: 'translateX(0%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-green-400/20 flex-shrink-0 bg-white dark:bg-[#062E1F]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('userDetails')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/50">
            <CloseIcon />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center space-x-4 rtl:space-x-reverse bg-white dark:bg-[#062E1F]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-xl text-gray-900 dark:text-white">{currentUser.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-green-400/20 flex-shrink-0 bg-white dark:bg-[#062E1F]">
            <nav className="flex space-x-4 rtl:space-x-reverse px-4">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('overview');
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('overview');
                    }}
                    className={`py-3 px-4 border-b-2 font-semibold text-sm touch-manipulation transition-all duration-200 ${activeTab === 'overview' ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10' : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                    {t('overview')}
                </button>
                 <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('transactions');
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('transactions');
                    }}
                    className={`py-3 px-4 border-b-2 font-semibold text-sm touch-manipulation transition-all duration-200 ${activeTab === 'transactions' ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10' : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                    {t('transactions')}
                </button>
            </nav>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Stat label={t('balance')} value={formatCurrency(currentUser.balance, locale)} />
                        <Stat label={t('investedAmount')} value={formatCurrency(currentUser.invested, locale)} />
                        <Stat label={t('status')} value={t(currentUser.status)} />
                        <Stat label={t('lastActive')} value={currentUser.lastActive ? formatDateTime(currentUser.lastActive, locale) : t('notAvailable', { defaultValue: 'N/A' })} />
                    </div>

                    <div className="space-y-3">
                         <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-base">{t('accountActions')}</h4>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBalanceAdjust('add');
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBalanceAdjust('add');
                                }}
                                className="p-3 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                            >
                                {t('addBalance')}
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBalanceAdjust('deduct');
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBalanceAdjust('deduct');
                                }}
                                className="p-3 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                            >
                                {t('deductBalance')}
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAdjustInvestment();
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAdjustInvestment();
                                }}
                                className="p-3 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                            >
                                {t('adjustInvestment')}
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleToggleFeeExemption();
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleToggleFeeExemption();
                                }}
                                className={`p-3 text-sm font-medium rounded-lg active:opacity-80 touch-manipulation ${currentUser.isFeeExempt ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                            >
                                {currentUser.isFeeExempt ? t('removeFeeExemption') : t('waiveFees')}
                            </button>
                            {currentUser.isFrozen ? (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUnfreeze();
                                    }}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUnfreeze();
                                    }}
                                    className="p-3 text-sm font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 col-span-2 touch-manipulation"
                                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                >
                                    {t('unfreezeAccount')}
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleFreeze();
                                    }}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleFreeze();
                                    }}
                                    className="p-3 text-sm font-medium rounded-lg bg-yellow-200 dark:bg-yellow-700 hover:bg-yellow-300 dark:hover:bg-yellow-600 active:bg-yellow-400 dark:active:bg-yellow-800 touch-manipulation"
                                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                >
                                    {t('freezeAccount')}
                                </button>
                            )}
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBan();
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBan();
                                }}
                                className="p-3 text-sm font-medium rounded-lg bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200 hover:bg-red-300 dark:hover:bg-red-600 active:bg-red-400 dark:active:bg-red-800 touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                            >
                                {t('banAccount')}
                            </button>
                         </div>
                    </div>
                     <div className="space-y-3">
                         <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-base">{t('kyc')}</h4>
                          <div className="grid grid-cols-2 gap-3">
                                {currentUser.status === UserStatus.PENDING && (
                                    <>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleApproveKYC();
                                            }}
                                            onTouchStart={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleApproveKYC();
                                            }}
                                            className="p-3 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 active:bg-green-700 touch-manipulation"
                                            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                        >
                                            {t('approveKYC')}
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRejectKYC();
                                            }}
                                            onTouchStart={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRejectKYC();
                                            }}
                                            className="p-3 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 active:bg-red-700 touch-manipulation"
                                            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                        >
                                            {t('rejectKYC')}
                                        </button>
                                    </>
                                )}
                                {currentUser.status !== UserStatus.PENDING && (
                                     <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRequestDocuments();
                                        }}
                                        onTouchStart={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRequestDocuments();
                                        }}
                                        className="p-3 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 col-span-2 touch-manipulation"
                                        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                    >
                                        {t('requestDocuments')}
                                    </button>
                                )}
                         </div>
                    </div>

                </div>
            )}
             {activeTab === 'transactions' && (
                <div>
                     {userTransactions.length > 0 ? (
                        <div className="space-y-1 -mx-4">
                            {userTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} onSelect={setSelectedTx} />)}
                        </div>
                     ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noTransactions')}</p>
                     )}
                </div>
            )}

        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        {modalContent}
      </Modal>
    </>
  );
};

export default UserDetailDrawer;