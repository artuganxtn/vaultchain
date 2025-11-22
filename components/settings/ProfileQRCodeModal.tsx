import React from 'react';
import Modal from '../ui/Modal';
import { useTranslation } from '../../contexts/LanguageContext';
import { User } from '../../types';
import QRCodeDisplay from '../ui/QRCodeDisplay';

interface ProfileQRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const ProfileQRCodeModal: React.FC<ProfileQRCodeModalProps> = ({ isOpen, onClose, user }) => {
    const { t } = useTranslation();

    // Payload includes a type and the user's unique ID
    const qrPayload = JSON.stringify({ t: 'user_profile', v: user.id });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('yourPersonalCode', { defaultValue: 'Your Personal Code' })}>
            <div className="text-center py-4 space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg inline-block">
                    <QRCodeDisplay value={qrPayload} size={160} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    {t('scanToPayMe', { defaultValue: 'Let others scan this QR code to send you funds directly.' })}
                </p>
                <div className="pt-2">
                    <button onClick={onClose} className="w-full max-w-xs mx-auto py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        {t('close')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileQRCodeModal;