
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../App';
import { useTranslation } from '../contexts/LanguageContext';
import { Transaction, TransactionType } from '../types';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';

const PendingRequestRow: React.FC<{
  tx: Transaction;
  userName: string;
  onReview: (tx: Transaction) => void;
}> = ({ tx, userName, onReview }) => {
  const { t } = useTranslation();
  const isDeposit = tx.type === TransactionType.DEPOSIT;
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0">
      <div className="mb-2 sm:mb-0">
        <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(tx.type.replace(/\s/g, ''))} - {new Date(tx.date).toLocaleString()}
        </p>
         <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">
          Ref: {tx.referenceCode || tx.id}
        </p>
      </div>
      <div className="flex items-center space-x-4 rtl:space-x-reverse w-full sm:w-auto">
        <p className={`font-bold text-lg ${isDeposit ? 'text-green-500' : 'text-red-500'}`}>
          {tx.originalAmount && tx.originalCurrency
            ? `${tx.originalAmount.toLocaleString('en-US')} ${tx.originalCurrency}`
            : tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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

const PendingRequestsView: React.FC = () => {
  const context = useContext(AppContext);
  const { t } = useTranslation();
  const [reviewingTx, setReviewingTx] = useState<Transaction | null>(null);

  const pendingRequests = useMemo(() => {
    return context?.data?.transactions
      .filter((tx) => tx.status === 'Awaiting Confirmation' && (tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.INVESTMENT_WITHDRAWAL_REQUEST))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  }, [context?.data?.transactions]);

  const handleApprove = () => {
    if (reviewingTx && context) {
        if(reviewingTx.type === TransactionType.DEPOSIT) {
            context.approveDeposit(reviewingTx.id);
        } else if (reviewingTx.type === TransactionType.INVESTMENT_WITHDRAWAL_REQUEST) {
            context.approveInvestmentWithdrawal(reviewingTx.id);
        }
      setReviewingTx(null);
    }
  };

  const handleReject = () => {
    if (reviewingTx && context) {
      if(reviewingTx.type === TransactionType.DEPOSIT) {
            context.rejectDeposit(reviewingTx.id);
        } else if (reviewingTx.type === TransactionType.INVESTMENT_WITHDRAWAL_REQUEST) {
            context.rejectInvestmentWithdrawal(reviewingTx.id);
        }
      setReviewingTx(null);
    }
  };

  const getUserName = (userId: string) => {
    return context?.data?.users.find(u => u.id === userId)?.name || 'Unknown User';
  };
  
  const isDeposit = reviewingTx?.type === TransactionType.DEPOSIT;
  const modalTitle = isDeposit ? t('reviewDeposit') : t('withdrawalRequest');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('pendingRequests')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('reviewAndApprove')}</p>
      </div>
      <Card className="p-0 overflow-hidden">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((tx) => (
            <PendingRequestRow
              key={tx.id}
              tx={tx}
              userName={getUserName(tx.userId)}
              onReview={setReviewingTx}
            />
          ))
        ) : (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noPendingRequests')}</p>
        )}
      </Card>

      {reviewingTx && (
        <Modal isOpen={!!reviewingTx} onClose={() => setReviewingTx(null)} title={modalTitle}>
          <div className="space-y-4">
            {isDeposit && (
                <>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{t('proofOfPayment')}</h3>
                    {reviewingTx.proofImageUrl ? (
                        <img src={reviewingTx.proofImageUrl} alt="Proof of payment" className="rounded-lg border border-gray-300 dark:border-gray-600 w-full max-h-80 object-contain" />
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">{t('noProofProvided')}</p>
                    )}
                </>
            )}
            
             <div className="border-t border-b border-gray-200 dark:border-gray-700 py-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('user')}</span><span>{getUserName(reviewingTx.userId)}</span></div>
                {reviewingTx.originalAmount && reviewingTx.originalCurrency ? (
                    <>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('originalAmount')}</span><span className="font-bold">{`${reviewingTx.originalAmount.toLocaleString('en-US')} ${reviewingTx.originalCurrency}`}</span></div>
                        {reviewingTx.originalCurrency !== 'USDT' && <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('convertedAmount')}</span><span className="font-bold">{reviewingTx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>}
                    </>
                ) : (
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('amount')}</span><span className="font-bold">{reviewingTx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                )}
                 <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('date')}</span><span>{new Date(reviewingTx.date).toLocaleString()}</span></div>
                 <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('referenceCode')}</span><span className="font-mono">{reviewingTx.referenceCode || 'N/A'}</span></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={handleReject} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700">{t('reject')}</button>
              <button onClick={handleApprove} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700">{t('approve')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingRequestsView;
