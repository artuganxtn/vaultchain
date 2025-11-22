import React from 'react';
import Modal from '../ui/Modal';
import { useTranslation } from '../../contexts/LanguageContext';

interface QRConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrData: any;
    onConfirm: () => void;
    isProcessing: boolean;
}

const DetailRow: React.FC<{ label: string, value: string | React.ReactNode }> = ({ label, value }) => (
     <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
);

const QRConfirmationModal: React.FC<QRConfirmationModalProps> = ({ isOpen, onClose, qrData, onConfirm, isProcessing }) => {
    const { t } = useTranslation();

    if (!qrData) return null;

    const isVoucher = qrData.t === 'voucher';
    const amount = qrData.v || 0;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('confirmRedemption')}>
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">{isVoucher ? t('voucherDetails') : 'Transaction Details'}</p>
                    <p className="text-4xl font-bold text-green-500 dark:text-green-400 my-2">
                        {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
                
                <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-2">
                    <DetailRow label={t('transactionType')} value={isVoucher ? t('voucher') : t('transfer')} />
                    <DetailRow label={t('amount')} value={amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                </div>
                
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">{t('redeemToWallet')}</p>

                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onClose} disabled={isProcessing} className="px-5 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">{t('cancel')}</button>
                    <button onClick={onConfirm} disabled={isProcessing} className="px-5 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                        {isProcessing ? t('processing') : t('confirm')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default QRConfirmationModal;