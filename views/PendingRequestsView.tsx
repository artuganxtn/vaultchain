
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../App';
import { useTranslation } from '../contexts/LanguageContext';
import { Transaction, TransactionType, User, UserStatus } from '../types';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import KYCReviewModal from '../components/admin/KYCReviewModal';
import { getLocaleFromLanguage, formatCurrency, formatDateTime } from '../utils/locale';

const PendingRequestRow: React.FC<{
  tx: Transaction;
  userName: string;
  onReview: (tx: Transaction) => void;
  locale: string;
}> = ({ tx, userName, onReview, locale }) => {
  const { t } = useTranslation();
  const isCredit = tx.amount >= 0 || tx.type === TransactionType.INVESTMENT_WITHDRAWAL_REQUEST;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0">
      <div className="mb-2 sm:mb-0 flex-grow">
        <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(tx.type.replace(/\s/g, ''))} - {formatDateTime(tx.date, locale)}
        </p>
         <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">
          Ref: {tx.referenceCode || tx.id}
        </p>
      </div>
      <div className="flex items-center justify-between sm:justify-end space-x-4 rtl:space-x-reverse w-full sm:w-auto mt-2 sm:mt-0">
        <p className={`font-bold text-lg ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
          {tx.originalAmount && tx.originalCurrency
            ? `${tx.originalAmount.toLocaleString(locale)} ${tx.originalCurrency}`
            : formatCurrency(tx.amount, locale)}
        </p>
        <button
          onClick={() => onReview(tx)}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          {t('review')}
        </button>
      </div>
    </div>
  );
};

const KYCRequestRow: React.FC<{
  user: User;
  onReview: (user: User) => void;
}> = ({ user, onReview }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0">
      <div className="mb-2 sm:mb-0 flex-grow">
        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
      </div>
      <div className="flex items-center justify-between sm:justify-end space-x-4 rtl:space-x-reverse w-full sm:w-auto mt-2 sm:mt-0">
        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{t('Pending')}</span>
        <button
          onClick={() => onReview(user)}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          {t('review')}
        </button>
      </div>
    </div>
  );
};

const PendingRequestsView: React.FC = () => {
  const context = useContext(AppContext);
  const { t, language } = useTranslation();
  const [reviewingTx, setReviewingTx] = useState<Transaction | null>(null);
  const [reviewingUser, setReviewingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'disputes' | 'kyc'>('deposits');
  const locale = getLocaleFromLanguage(language);

  if (!context) return null;
  const { data, approveDeposit, rejectDeposit, approveInvestmentWithdrawal, rejectInvestmentWithdrawal, approveWithdrawal, rejectWithdrawal, resolveDispute, approveKyc, rejectKyc } = context;
  const { transactions, users } = data!;

  const { pendingDeposits, pendingWithdrawals, escalatedDisputes, pendingKycUsers } = useMemo(() => {
    const deposits = transactions.filter(tx => tx.status === 'Awaiting Confirmation' && tx.type === TransactionType.DEPOSIT);
    const withdrawals = transactions.filter(tx => tx.status === 'Awaiting Confirmation' && (tx.type === TransactionType.INVESTMENT_WITHDRAWAL_REQUEST || tx.type === TransactionType.WITHDRAWAL));
    const disputes = transactions.filter(tx => tx.dispute?.status === 'Escalated');
    const kycUsers = users.filter(u => u.status === UserStatus.PENDING);
    return { pendingDeposits: deposits, pendingWithdrawals: withdrawals, escalatedDisputes: disputes, pendingKycUsers: kycUsers };
  }, [transactions, users]);
  
  const currentList = activeTab === 'deposits' ? pendingDeposits : activeTab === 'withdrawals' ? pendingWithdrawals : activeTab === 'disputes' ? escalatedDisputes : pendingKycUsers;

  const handleApprove = () => {
    if (!reviewingTx) return;
    switch(reviewingTx.type) {
        case TransactionType.DEPOSIT: approveDeposit(reviewingTx.id); break;
        case TransactionType.INVESTMENT_WITHDRAWAL_REQUEST: approveInvestmentWithdrawal(reviewingTx.id); break;
        case TransactionType.WITHDRAWAL: approveWithdrawal(reviewingTx.id); break;
    }
    setReviewingTx(null);
  };

  const handleReject = () => {
    if (!reviewingTx) return;
    switch(reviewingTx.type) {
        case TransactionType.DEPOSIT: rejectDeposit(reviewingTx.id); break;
        case TransactionType.INVESTMENT_WITHDRAWAL_REQUEST: rejectInvestmentWithdrawal(reviewingTx.id); break;
        case TransactionType.WITHDRAWAL: rejectWithdrawal(reviewingTx.id); break;
    }
    setReviewingTx(null);
  };

  const handleResolveDispute = (winnerId: string) => {
    if (reviewingTx) {
      resolveDispute(reviewingTx.id, winnerId);
      setReviewingTx(null);
    }
  };

  const getUser = (userId: string): User | undefined => users.find(u => u.id === userId);

  const getModalTitle = () => {
    if (!reviewingTx) return '';
    if (reviewingTx.dispute) return t('disputeReview');
    switch (reviewingTx.type) {
      case TransactionType.DEPOSIT: return t('reviewDeposit');
      case TransactionType.INVESTMENT_WITHDRAWAL_REQUEST:
      case TransactionType.WITHDRAWAL:
        return t('withdrawalRequest');
      default: return 'Review Request';
    }
  };

  const renderModalContent = () => {
    if (!reviewingTx) return null;
    const isDispute = !!reviewingTx.dispute;
    const sender = getUser(reviewingTx.userId);
    const recipient = reviewingTx.recipientId ? getUser(reviewingTx.recipientId) : undefined;

    return (
        <div className="space-y-4">
            {reviewingTx.type === TransactionType.DEPOSIT && reviewingTx.proofImageUrl && (
                 <img src={reviewingTx.proofImageUrl} alt="Proof of payment" className="rounded-lg border border-gray-300 dark:border-gray-600 w-full max-h-80 object-contain" />
            )}
            
             <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3 space-y-2 text-sm">
                {!isDispute && <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('user')}</span><span>{sender?.name || '...'}</span></div>}
                
                {isDispute && (
                    <>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('sender')}</span><span>{sender?.name || '...'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('recipient')}</span><span>{recipient?.name || '...'}</span></div>
                    </>
                )}

                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('amount')}</span><span className="font-bold">{formatCurrency(Math.abs(reviewingTx.amount), locale)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('date')}</span><span>{formatDateTime(reviewingTx.date, locale)}</span></div>

                 {reviewingTx.type === TransactionType.WITHDRAWAL && (() => {
                    // Parse withdrawalDetails if it's a string
                    let withdrawalDetails = reviewingTx.withdrawalDetails;
                    if (typeof withdrawalDetails === 'string') {
                        try {
                            withdrawalDetails = JSON.parse(withdrawalDetails);
                        } catch (e) {
                            console.error('[PendingRequests] Failed to parse withdrawalDetails:', e);
                            withdrawalDetails = null;
                        }
                    }
                    
                    return withdrawalDetails ? (
                        <div className="pt-2 border-t dark:border-gray-600 mt-2">
                            <h4 className="text-gray-500 dark:text-gray-400 font-semibold mb-2">{t('withdrawalDetails')}</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('method')}</span>
                                    <span className="font-medium">{withdrawalDetails.method === 'bank' ? t('bankTransfer') : t('cryptoWallet')}</span>
                                </div>
                                {withdrawalDetails.method === 'bank' && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">{t('recipientName')}</span>
                                            <span className="font-medium text-right break-words max-w-[60%]">{withdrawalDetails.recipientName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">{t('iban')}</span>
                                            <span className="font-mono text-right break-all max-w-[60%]">{withdrawalDetails.iban || 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                                {withdrawalDetails.method === 'crypto' && (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">{t('cryptoAddress')}</span>
                                            <span className="font-mono text-sm break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">{withdrawalDetails.cryptoAddress || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">{t('network')}</span>
                                            <span className="font-medium">{withdrawalDetails.cryptoNetwork || 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="pt-2 border-t dark:border-gray-600 mt-2">
                            <p className="text-yellow-600 dark:text-yellow-400 text-sm">{t('noWithdrawalDetails') || 'No withdrawal details provided'}</p>
                        </div>
                    );
                 })()}
                 
                 {isDispute && (
                    <div className="pt-2 border-t dark:border-gray-600 mt-2">
                        <h4 className="text-gray-500 dark:text-gray-400 font-semibold">{t('disputeDetails')}</h4>
                        <p><strong>{t('disputeReason')}:</strong> {t(reviewingTx.dispute!.reason)}</p>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">{reviewingTx.dispute!.details}</p>
                    </div>
                 )}
            </div>
            <div className="flex justify-end gap-3">
              {isDispute ? (
                  <>
                      <button onClick={() => handleResolveDispute(recipient!.id)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">{t('resolveForRecipient')}</button>
                      <button onClick={() => handleResolveDispute(sender!.id)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700">{t('resolveForSender')}</button>
                  </>
              ) : (
                  <>
                    <button onClick={handleReject} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700">{t('reject')}</button>
                    <button onClick={handleApprove} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700">{t('approve')}</button>
                  </>
              )}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('pendingRequests')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('reviewAndApprove')}</p>
      </div>

       <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 gap-1">
          <button onClick={() => setActiveTab('deposits')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'deposits' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t('Deposits')} ({pendingDeposits.length})</button>
          <button onClick={() => setActiveTab('withdrawals')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'withdrawals' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t('Withdrawal')}s ({pendingWithdrawals.length})</button>
          <button onClick={() => setActiveTab('disputes')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'disputes' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t('Disputes')} ({escalatedDisputes.length})</button>
           <button onClick={() => setActiveTab('kyc')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'kyc' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t('kyc')} ({pendingKycUsers.length})</button>
      </div>

      <Card className="p-0 overflow-hidden">
        {currentList.length > 0 ? (
            activeTab === 'kyc' ? (
                (currentList as User[]).map(user => (
                    <KYCRequestRow key={user.id} user={user} onReview={setReviewingUser} />
                ))
            ) : (
                (currentList as Transaction[]).map(tx => (
                    <PendingRequestRow key={tx.id} tx={tx} userName={getUser(tx.userId)?.name || '...'} onReview={setReviewingTx} locale={locale} />
                ))
            )
        ) : (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noPendingRequests')}</p>
        )}
      </Card>

      {reviewingTx && <Modal isOpen={!!reviewingTx} onClose={() => setReviewingTx(null)} title={getModalTitle()}>{renderModalContent()}</Modal>}
      {reviewingUser && <KYCReviewModal user={reviewingUser} onClose={() => setReviewingUser(null)} onApprove={approveKyc} onReject={rejectKyc} />}
    </div>
  );
};

export default PendingRequestsView;
