import React, { useState, useContext, useMemo } from 'react';
import { User, UserStatus, Transaction, TransactionType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { CloseIcon } from '../ui/Icons';
import Modal from '../ui/Modal';
import { AppContext } from '../../App';
import TransactionRow from '../ui/TransactionRow';

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
    onConfirm: (amount: number, reason: string) => void;
}> = ({ onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount) && numAmount > 0) {
            onConfirm(numAmount, reason);
        }
    };

    return (
        <div className="space-y-4">
            <input type="number" placeholder={t('amount')} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="text" placeholder={t('reasonForAdjustment')} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div className="flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                <button onClick={handleConfirm} disabled={!amount || parseFloat(amount) <= 0} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">{t('confirm')}</button>
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

    const handleConfirm = async () => {
        setError('');
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError(t('amountRequired'));
            return;
        }
        if (!reason.trim()) {
            setError(t('reasonForActionMandatory'));
            return;
        }

        setIsProcessing(true);
        const errorResult = await onConfirm(type, action, numAmount, reason);
        if (errorResult) {
            setError(errorResult);
        }
        // Parent will close on success
        setIsProcessing(false);
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
                 <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
             <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reasonForActionMandatory')}</label>
                <input type="text" placeholder={t('reasonForAdjustment')} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <div className="flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                <button onClick={handleConfirm} disabled={!amount || !reason || isProcessing} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">{isProcessing ? t('processing') : t('confirm')}</button>
            </div>
        </div>
    );
};

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, onClose, onUpdateUser }) => {
  const { t } = useTranslation();
  const context = React.useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [reason, setReason] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null); // For future detail view

  const userTransactions = useMemo(() => {
    if (!context?.data?.transactions) return [];
    return context.data.transactions
      .filter(tx => tx.userId === user.id || tx.recipientId === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [context?.data?.transactions, user.id]);

  const handleBalanceAdjust = (type: 'add' | 'deduct') => {
      setModalTitle(type === 'add' ? t('addBalance') : t('deductBalance'));
      
      const confirmCallback = async (amount: number, reason: string) => {
          const newBalance = type === 'add' ? user.balance + amount : user.balance - amount;
          const details = `${type === 'add' ? 'Added' : 'Deducted'} ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${user.name}. Reason: ${reason || 'Not specified'}`;
          
          await context?.addAuditLog(type === 'add' ? 'ADD_BALANCE' : 'DEDUCT_BALANCE', details, user.id);
          
          // FIX: Added missing status property
          await context?.adminAddTransaction(user.id, {
              description: `Admin ${type === 'add' ? 'Adjustment' : 'Deduction'}. Reason: ${reason || 'N/A'}`,
              amount: type === 'add' ? amount : -amount,
              type: TransactionType.ADMIN_ADJUSTMENT,
              status: 'Completed'
          });
          
          await onUpdateUser({ ...user, balance: newBalance });
          setModalOpen(false);
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
    setReason(''); // Reset reason state
    setModalTitle(title);
    
    // Create a controlled component that manages its own state
    const ReasonModalContent: React.FC = () => {
      const [localReason, setLocalReason] = useState('');
      
      return (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          <textarea
              value={localReason}
              onChange={(e) => setLocalReason(e.target.value)}
              placeholder={t('reasonForActionMandatory')}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
              autoFocus
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                setLocalReason('');
                setModalOpen(false);
              }} 
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={async () => { 
                await onConfirm(localReason); 
                setLocalReason('');
                setModalOpen(false); 
              }} 
              disabled={!localReason.trim()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      );
    };
    
    setModalContent(<ReasonModalContent />);
    setModalOpen(true);
  };

  const handleFreeze = () => confirmActionWithReason(t('freezeAccount'), t('areYouSureFreeze'), async (reasonText) => {
    await context?.addAuditLog('FREEZE_ACCOUNT', `Account frozen. Reason: ${reasonText}`, user.id);
    await onUpdateUser({ 
        ...user, 
        isFrozen: true,
        notification: {
            type: 'freeze',
            reason: reasonText,
            timestamp: Date.now()
        }
    });
  });

  const handleUnfreeze = async () => {
    await context?.addAuditLog('UNFREEZE_ACCOUNT', `Account unfrozen.`, user.id);
    await onUpdateUser({ ...user, isFrozen: false });
  };
  
  const handleBan = () => confirmActionWithReason(t('banAccount'), t('areYouSureBan'), async (reasonText) => {
    await context?.addAuditLog('BAN_ACCOUNT', `Account banned. Reason: ${reasonText}`, user.id);
    await onUpdateUser({ 
        ...user, 
        isBanned: true,
        notification: {
            type: 'ban',
            reason: reasonText,
            timestamp: Date.now()
        }
    });
  });

  const handleApproveKYC = async () => await context?.approveKyc(user.id);
  const handleRejectKYC = () => {
    confirmActionWithReason(t('rejectKYC'), "Provide a reason for rejection.", async (reasonText) => {
      await context?.rejectKyc(user.id, reasonText);
    });
  };

  const handleRequestDocuments = () => {
    alert(`A notification has been sent to ${user.name} to upload their KYC documents.`);
    // In a real app, this would trigger a backend event to send an email or push notification.
  };

  const handleToggleFeeExemption = async () => {
    await context?.addAuditLog(
        user.isFeeExempt ? 'REMOVE_FEE_EXEMPTION' : 'GRANT_FEE_EXEMPTION',
        `${user.isFeeExempt ? 'Removed' : 'Granted'} fee exemption for ${user.name}.`,
        user.id
    );
    await onUpdateUser({ ...user, isFeeExempt: !user.isFeeExempt });
  };
  
  const handleAdjustInvestment = () => {
    setModalTitle(t('adjustInvestment'));

    const confirmCallback = async (type: 'invested' | 'unclaimedProfit', action: 'add' | 'deduct', amount: number, reason: string): Promise<string | null> => {
        const currentUserState = context?.data?.users.find(u => u.id === user.id) || user;

        if (action === 'add' && type === 'invested' && currentUserState.balance < amount) {
            return t('insufficientFunds');
        }
        if (action === 'deduct' && type === 'invested' && currentUserState.invested < amount) {
            return t('insufficientInvestedBalance');
        }
        if (action === 'deduct' && type === 'unclaimedProfit' && currentUserState.unclaimedProfit < amount) {
            return t('insufficientUnclaimedProfit');
        }
        
        const updatedUser = { ...currentUserState };
        let details = '';

        if (type === 'invested') {
            if (action === 'add') {
                updatedUser.invested += amount;
                updatedUser.balance -= amount;
                details = `Admin added ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to invested balance.`;
            } else { // deduct
                updatedUser.invested -= amount;
                updatedUser.balance += amount;
                details = `Admin deducted ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} from invested balance.`;
            }
        } else { // unclaimedProfit
             if (action === 'add') {
                updatedUser.unclaimedProfit += amount;
                details = `Admin added ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to unclaimed profit.`;
            } else { // deduct
                updatedUser.unclaimedProfit -= amount;
                details = `Admin deducted ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} from unclaimed profit.`;
            }
        }
        
        await context?.addAuditLog('ADJUST_INVESTMENT', `${details} Reason: ${reason}`, user.id);
        await onUpdateUser(updatedUser);
        setModalOpen(false);
        return null; // Success
    };
    
    setModalContent(<InvestmentAdjustModalContent user={user} onClose={() => setModalOpen(false)} onConfirm={confirmCallback} />);
    setModalOpen(true);
};

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <div className="fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-full max-w-lg bg-gray-100 dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: 'translateX(0%)' }}>
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
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-xl text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-green-400/20 flex-shrink-0 bg-white dark:bg-[#062E1F]">
            <nav className="flex space-x-4 rtl:space-x-reverse px-4">
                <button onClick={() => setActiveTab('overview')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'overview' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    {t('overview')}
                </button>
                 <button onClick={() => setActiveTab('transactions')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'transactions' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    {t('transactions')}
                </button>
            </nav>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Stat label={t('balance')} value={user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                        <Stat label={t('investedAmount')} value={user.invested.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                        <Stat label={t('status')} value={t(user.status)} />
                        <Stat label={t('lastActive')} value={user.lastActive ? new Date(user.lastActive).toLocaleString() : 'N/A'} />
                    </div>

                    <div className="space-y-3">
                         <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('accountActions')}</h4>
                         <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleBalanceAdjust('add')} className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{t('addBalance')}</button>
                            <button onClick={() => handleBalanceAdjust('deduct')} className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{t('deductBalance')}</button>
                            <button onClick={handleAdjustInvestment} className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{t('adjustInvestment')}</button>
                            <button onClick={handleToggleFeeExemption} className={`p-2 text-sm rounded-lg ${user.isFeeExempt ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                                {user.isFeeExempt ? t('removeFeeExemption') : t('waiveFees')}
                            </button>
                            {user.isFrozen ? (
                                <button onClick={handleUnfreeze} className="p-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 col-span-2">{t('unfreezeAccount')}</button>
                            ) : (
                                <button onClick={handleFreeze} className="p-2 text-sm rounded-lg bg-yellow-200 dark:bg-yellow-700 hover:bg-yellow-300 dark:hover:bg-yellow-600">{t('freezeAccount')}</button>
                            )}
                            <button onClick={handleBan} className="p-2 text-sm rounded-lg bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200 hover:bg-red-300 dark:hover:bg-red-600">{t('banAccount')}</button>
                         </div>
                    </div>
                     <div className="space-y-3">
                         <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('kyc')}</h4>
                          <div className="grid grid-cols-2 gap-3">
                                {user.status === UserStatus.PENDING && (
                                    <>
                                        <button onClick={handleApproveKYC} className="p-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600">{t('approveKYC')}</button>
                                        <button onClick={handleRejectKYC} className="p-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600">{t('rejectKYC')}</button>
                                    </>
                                )}
                                {user.status !== UserStatus.PENDING && (
                                     <button onClick={handleRequestDocuments} className="p-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 col-span-2">{t('requestDocuments')}</button>
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