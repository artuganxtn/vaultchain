

import React, { useState, useContext } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { AppContext } from '../../App';
import Modal from '../ui/Modal';
import { TetherIcon, BankIcon, CopyIcon, QrCodeIcon, DocumentArrowUpIcon } from '../ui/Icons';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject('Failed to convert blob to base64');
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const DepositModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    
    const [step, setStep] = useState<'selection' | 'details' | 'success'>('selection');
    const [method, setMethod] = useState<'usdt' | 'bank' | null>(null);
    const [amount, setAmount] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState('');
    
    const referenceCode = React.useMemo(() => `VC-${Date.now().toString().slice(-6)}`, [step]);
    const usdtAddress = 'TBaGgZW2a43eZcrgDavnJgZ9mM2DRoMXZM';
    const localDepositorDetails = { name: 'Naime Kıddo', phone: '+905365705836' };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            const previewUrl = URL.createObjectURL(file);
            setProofPreview(previewUrl);
        }
    };
    
    const handleSubmit = async () => {
        if (method !== 'usdt' || !amount || !proofFile || !context) return;
        setIsLoading(true);
        try {
            const proofBase64 = await blobToBase64(proofFile);
            const enteredAmount = parseFloat(amount);
            
            const originalCurrency = 'USDT';
            const usdAmount = enteredAmount;
            
            context.handleDepositRequest(usdAmount, referenceCode, proofBase64, enteredAmount, originalCurrency);
            setStep('success');
        } catch (error) {
            console.error("Error processing deposit request:", error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetState = () => {
        setStep('selection');
        setMethod(null);
        setAmount('');
        setProofFile(null);
        setProofPreview(null);
        setIsLoading(false);
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'selection':
                return (
                    <div className="space-y-4">
                        <button onClick={() => { setMethod('usdt'); setStep('details'); }} className="w-full text-left flex items-center p-4 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200/70 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <TetherIcon />
                            <div className="ms-4">
                                <p className="font-semibold text-gray-900 dark:text-white">USDT (TRC20)</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Crypto Transfer</p>
                            </div>
                        </button>
                        <button onClick={() => { setMethod('bank'); setStep('details'); }} className="w-full text-left flex items-center p-4 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200/70 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <BankIcon className="w-8 h-8 text-gray-600 dark:text-gray-300"/>
                            <div className="ms-4">
                                <p className="font-semibold text-gray-900 dark:text-white">{t('localDeposit', { defaultValue: 'Local Deposit' })}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('turkey')}</p>
                            </div>
                        </button>
                    </div>
                );
            case 'details':
                if (method === 'usdt') {
                    return (
                        <div className="space-y-4 text-sm">
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                                <p className="text-xs text-green-800 dark:text-green-300">{t('referenceCode')}</p>
                                <p className="font-mono text-lg font-bold text-green-600 dark:text-green-400">{referenceCode}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-center"><QrCodeIcon className="w-24 h-24 mx-auto" /></div>
                                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-2"><p className="truncate flex-1 text-start px-2 font-mono">{usdtAddress}</p><button onClick={() => handleCopy(usdtAddress, 'addr')} className="bg-green-500 text-white px-2 py-1 rounded-md font-semibold flex items-center space-x-1 rtl:space-x-reverse text-xs"><CopyIcon className="w-4 h-4" /><span>{copied==='addr' ? t('copied') : t('copy')}</span></button></div>
                            </div>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('amountSent')} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                            <div>
                                <label htmlFor="file-upload" className="w-full cursor-pointer flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600/50">
                                    <DocumentArrowUpIcon className="w-6 h-6 me-2 text-gray-500 dark:text-gray-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('uploadProof')}</span>
                                </label>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                {proofPreview && <img src={proofPreview} alt="Proof preview" className="mt-2 rounded-lg max-h-32 mx-auto" />}
                            </div>
                            <div className="flex items-center space-x-3 rtl:space-x-reverse pt-2">
                                <button onClick={resetState} className="w-full py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button>
                                <button onClick={handleSubmit} disabled={!amount || !proofFile || isLoading} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? t('processing') : t('sendProof')}</button>
                            </div>
                        </div>
                    );
                }
                if (method === 'bank') {
                    return (
                        <div className="space-y-4 text-center">
                            <p className="text-gray-600 dark:text-gray-300">
                                لإتمام عملية الإيداع، يرجى التواصل مع الرقم التالي عبر واتساب.
                            </p>
                            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-2 max-w-sm mx-auto">
                                <p className="truncate flex-1 text-center px-2 font-mono text-lg">{localDepositorDetails.phone}</p>
                                <button onClick={() => handleCopy(localDepositorDetails.phone, 'phone')} className="bg-green-500 text-white px-3 py-1.5 rounded-md font-semibold flex items-center space-x-2 rtl:space-x-reverse text-sm">
                                    <CopyIcon className="w-4 h-4"/>
                                    <span>{copied === 'phone' ? t('copied') : t('copy')}</span>
                                </button>
                            </div>
                            <div className="pt-4">
                                <button onClick={resetState} className="w-full max-w-sm mx-auto py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('close')}</button>
                            </div>
                        </div>
                    );
                }
                return null;
             case 'success':
                return (
                     <div className="text-center py-4 space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{t('depositConfirmationMessage')}</p>
                        <button onClick={resetState} className="w-full py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('close')}</button>
                    </div>
                )
        }
    };

    const modalTitle = step === 'selection' ? t('Deposit') : step === 'details' ? t('depositDetails') : t('depositConfirmationTitle');

    return (
        <Modal isOpen={isOpen} onClose={resetState} title={modalTitle}>
            {renderContent()}
        </Modal>
    );
};

export default DepositModal;