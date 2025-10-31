import React from 'react';
import { User } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import Modal from '../ui/Modal';

interface KYCReviewModalProps {
    user: User;
    onClose: () => void;
    onApprove: (userId: string) => void;
    onReject: (userId: string, reason: string) => void;
}

const KYCReviewModal: React.FC<KYCReviewModalProps> = ({ user, onClose, onApprove, onReject }) => {
    const { t } = useTranslation();
    const [rejectionReason, setRejectionReason] = React.useState('');
    const [isRejecting, setIsRejecting] = React.useState(false);

    const handleApprove = () => {
        onApprove(user.id);
        onClose();
    };

    const handleConfirmReject = () => {
        if (rejectionReason.trim()) {
            onReject(user.id, rejectionReason);
            onClose();
        }
    };
    
    const docTypes = [
        { key: 'id_front', label: 'ID Front' },
        { key: 'id_back', label: 'ID Back' },
        { key: 'license_front', label: 'License Front' },
        { key: 'license_back', label: 'License Back' },
        { key: 'passport', label: 'Passport' },
        { key: 'address_proof', label: 'Proof of Address' },
    ] as const;

    return (
        <Modal isOpen={true} onClose={onClose} title={`${t('kyc')} - ${user.name}`} size="lg">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {docTypes.map(doc => {
                        const imageData = user.kycDocuments?.[doc.key];
                        if (imageData) {
                            return (
                                <div key={doc.key}>
                                    <h4 className="font-semibold text-sm mb-1 text-gray-800 dark:text-gray-200">{doc.label}</h4>
                                    <img src={imageData} alt={doc.label} className="rounded-lg border border-gray-300 dark:border-gray-600 w-full object-contain" />
                                </div>
                            )
                        }
                        return null;
                    })}
                </div>
                
                {isRejecting ? (
                    <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                        <h3 className="font-semibold text-red-600">{t('reasonForRejection')}</h3>
                        <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder={t('provideReason')}
                        />
                         <div className="flex justify-end gap-3">
                            <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                            <button onClick={handleConfirmReject} disabled={!rejectionReason.trim()} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{t('confirm')}</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                        <button onClick={() => setIsRejecting(true)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700">{t('reject')}</button>
                        <button onClick={handleApprove} className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700">{t('approve')}</button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default KYCReviewModal;
