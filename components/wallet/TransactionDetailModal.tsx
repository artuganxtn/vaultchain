import React, { useState } from 'react';
import { Transaction, User, TransactionType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import Modal from '../ui/Modal';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    user: User;
    allUsers: User[];
    onFileDispute: (transactionId: string, reason: string, details: string) => Promise<boolean>;
    onRefundDispute: (transactionId: string) => void;
    onEscalateDispute: (transactionId: string) => void;
    onDisputeSuccess: () => void;
}

const DetailRow: React.FC<{ label: string, value: React.ReactNode, isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-200 dark:border-gray-700/50 last:border-0">
        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</span>
        <span className={`text-sm text-gray-900 dark:text-white text-end ${isMono ? 'font-mono' : 'font-medium'}`}>{value}</span>
    </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = (props) => {
    const { isOpen, onClose, transaction, user, allUsers, onFileDispute, onRefundDispute, onEscalateDispute, onDisputeSuccess } = props;
    const { t } = useTranslation();
    
    const [view, setView] = useState<'details' | 'file_dispute' | 'confirm_refund' | 'confirm_escalate'>('details');
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDetails, setDisputeDetails] = useState('');
    const [error, setError] = useState('');

    const sender = allUsers.find(u => u.id === transaction.userId);
    const recipient = transaction.recipientId ? allUsers.find(u => u.id === transaction.recipientId) : null;
    
    const isSender = user.id === transaction.userId;
    const isRecipient = user.id === transaction.recipientId;
    const isDisputable = transaction.type === TransactionType.INTERNAL_TRANSFER && transaction.status === 'Completed';

    const handleFileDispute = async () => {
        if (!disputeReason) {
            setError(t('selectReason'));
            return;
        }
        const success = await onFileDispute(transaction.id, disputeReason, disputeDetails);
        if (success) {
            onDisputeSuccess();
            onClose();
        } else {
            setError(t('disputeCouldNotBeFiled'));
        }
    }

    const handleRefund = () => {
        onRefundDispute(transaction.id);
        onClose();
    }
    
    const handleEscalate = () => {
        onEscalateDispute(transaction.id);
        onClose();
    }
    
    const renderActionButtons = () => {
        if (!isDisputable) return null;

        if (isSender && !transaction.dispute && isDisputable) {
            return <button onClick={() => setView('file_dispute')} className="w-full py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">{t('fileDispute')}</button>;
        }
        
        if (isRecipient && transaction.dispute?.status === 'Open' && isDisputable) {
            return (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <button onClick={() => setView('confirm_refund')} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg">{t('refund')}</button>
                    <button onClick={() => setView('confirm_escalate')} className="w-full py-2.5 bg-yellow-500 text-white font-bold rounded-lg">{t('escalateToAdmin')}</button>
                </div>
            );
        }

        return null;
    }

    const renderContent = () => {
        switch(view) {
            case 'file_dispute':
                return (
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('disputeReason')}</label>
                            <select value={disputeReason} onChange={(e) => {setDisputeReason(e.target.value); setError('');}} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="">{t('selectReason')}</option><option value="incorrectAmount">{t('incorrectAmount')}</option><option value="notRecognized">{t('notRecognized')}</option><option value="didNotReceive">{t('didNotReceive')}</option><option value="other">{t('other')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('additionalDetails')}</label>
                            <textarea value={disputeDetails} onChange={(e) => setDisputeDetails(e.target.value)} rows={3} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <button onClick={() => setView('details')} className="w-full py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">{t('back')}</button>
                            <button onClick={handleFileDispute} disabled={!disputeReason} className="w-full py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">{t('submitDispute')}</button>
                        </div>
                    </div>
                );
            case 'confirm_refund':
                 return (
                    <div className="space-y-4 text-center">
                        <p>{t('refundConfirmation', { amount: Math.abs(transaction.amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'}), senderName: sender?.name })}</p>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <button onClick={() => setView('details')} className="w-full py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button>
                            <button onClick={handleRefund} className="w-full py-2 bg-green-600 text-white rounded-lg">{t('confirm')}</button>
                        </div>
                    </div>
                );
            case 'confirm_escalate':
                return (
                    <div className="space-y-4 text-center">
                        <p>{t('escalateConfirmation', { defaultValue: 'Are you sure you want to escalate this dispute to an administrator for review?'})}</p>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <button onClick={() => setView('details')} className="w-full py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">{t('cancel')}</button>
                            <button onClick={handleEscalate} className="w-full py-2 bg-yellow-500 text-white rounded-lg">{t('confirm')}</button>
                        </div>
                    </div>
                );
            default: // 'details'
                return (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{transaction.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
                            <p className="text-sm text-gray-500">{t(transaction.type.replace(/\s/g, ''))}</p>
                        </div>
                        <div className="space-y-1">
                            <DetailRow label={t('status')} value={t(transaction.status)} />
                            <DetailRow label={t('date')} value={new Date(transaction.date).toLocaleString()} />
                            <DetailRow label={t('transactionID')} value={transaction.id} isMono />
                            {sender && <DetailRow label={t('from')} value={sender.name} />}
                            {recipient && <DetailRow label={t('to')} value={recipient.name} />}
                        </div>
                        {renderActionButtons()}
                    </div>
                );
        }
    };
    
    const getTitle = () => {
        switch(view) {
            case 'file_dispute': return t('fileDispute');
            case 'confirm_refund':
            case 'confirm_escalate': return t('confirmAction');
            default: return t('transactionDetails');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            {renderContent()}
        </Modal>
    );
};

export default TransactionDetailModal;
