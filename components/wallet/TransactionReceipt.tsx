
import React, { useEffect, useState } from 'react';
import { Transaction, User } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import QRCodeDisplay from '../ui/QRCodeDisplay';

type Translations = { [key: string]: string };

interface TransactionReceiptProps {
    transaction: Transaction;
    sender: User;
    recipient?: User | null;
    allUsers?: User[]; // Add allUsers prop to fetch recipient if not provided
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ transaction, sender, recipient, allUsers }) => {
    const { language } = useTranslation();
    const [translations, setTranslations] = useState<Translations | null>(null);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const langToLoad = language === 'tr' ? 'tr' : (language === 'ar' ? 'ar' : 'en');
                const response = await fetch(`/translations/${langToLoad}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${langToLoad}.json`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error("Could not load receipt translations, falling back to English:", error);
                try {
                    const enResponse = await fetch(`/translations/en.json`);
                    const enData = await enResponse.json();
                    setTranslations(enData);
                } catch (e) {
                    console.error("Could not load fallback English translations:", e);
                }
            }
        };

        loadTranslations();
    }, [language]);


    const t = (key: string, fallback?: string): string => {
        return translations?.[key] || fallback || key;
    };
    
    // If recipient is not provided but transaction has recipientId, try to find it from allUsers
    const resolvedRecipient = recipient || (transaction.recipientId && allUsers ? allUsers.find(u => u.id === transaction.recipientId) : null);
    
    if (!translations) {
        return <div className="bg-white text-gray-800 p-8 font-mono max-w-md mx-auto animate-pulse">{t('loadingReceipt', 'Loading Receipt...')}</div>;
    }
    
    const ParticipantDetail: React.FC<{ title: string, name?: string, accountId?: string }> = ({ title, name, accountId }) => (
        <div>
            <h3 className="text-md font-bold text-gray-800 mb-2">{title}</h3>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">{t('receipt_name', 'Name')}:</span>
                    <span className="font-medium">{name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">{t('receipt_account_id', 'Account ID')}:</span>
                    <span className="font-mono">{accountId || 'N/A'}</span>
                </div>
            </div>
        </div>
    );

    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Istanbul'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Europe/Istanbul'
    });
    const displayDate = `${formattedDate} | ${formattedTime} TRT`;

    return (
        <div className="bg-white text-gray-800 p-8 font-sans max-w-md mx-auto border border-gray-200 shadow-lg">
            <header className="text-center relative">
                <h1 className="text-3xl font-extrabold text-gray-900 notranslate">
                    <span className="text-green-600">Vault</span>Chain
                </h1>
                <p className="text-sm text-gray-500">{t('receipt_title', 'Your Digital Transaction Receipt')}</p>
                 <div className="absolute top-0 right-0">
                    <QRCodeDisplay value={transaction.id} size={60} />
                 </div>
            </header>
            
            <hr className="border-t-2 border-dashed border-gray-300 my-4" />

            <section className="mb-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center mb-3">{t('receipt_summary', 'Transaction Summary')}</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">{t('receipt_date_time', 'Date & Time')}:</span> <span className="font-medium">{displayDate}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('receipt_tx_id', 'Transaction ID')}:</span> <span className="font-mono text-xs">{transaction.id}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('receipt_type', 'Type')}:</span> <span className="font-medium">{t(transaction.type.replace(/\s/g, ''))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('receipt_amount', 'Amount')}:</span> <span className="font-bold">{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('receipt_status', 'Status')}:</span> <span className="font-bold text-green-600">{t(transaction.status)}</span></div>
                </div>
            </section>
            
            <hr className="border-t-2 border-dashed border-gray-300 my-4" />
            
            <section className="mb-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center mb-3">{t('receipt_participants', 'Participant Details')}</h2>
                <div className="space-y-4">
                    <ParticipantDetail title={t('receipt_sender', 'Sender')} name={sender.name} accountId={sender.accountNumber} />
                    <ParticipantDetail title={t('receipt_recipient', 'Recipient')} name={resolvedRecipient?.name} accountId={resolvedRecipient?.accountNumber} />
                </div>
            </section>
            
            <hr className="border-t-2 border-dashed border-gray-300 my-4" />

            <section>
                 <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center mb-3">{t('receipt_support', 'Customer Support')}</h2>
                 <div className="space-y-2 text-xs text-center bg-gray-50 p-4 rounded-lg">
                    <p><strong>Email:</strong> support@vaultchaintr.online</p>
                    <p><strong>Phone:</strong> +905378299444 | +905074302420</p>
                    <p><strong>Website:</strong> vaultchaintr.online</p>
                    <p><strong>{t('receipt_support_hours', 'Support Hours (Turkey Time)')}:</strong> Monday - Friday: 09:00 AM - 06:00 PM</p>
                 </div>
            </section>

            <hr className="border-t-2 border-dashed border-gray-300 my-4" />

            <footer className="text-center">
                <p className="text-xs text-gray-600">{t('receipt_thank_you', 'Thank you for choosing VaultChain.')}</p>
                <p className="text-xs text-gray-600">Your security, our priority.</p>
            </footer>
        </div>
    );
};

export default TransactionReceipt;
