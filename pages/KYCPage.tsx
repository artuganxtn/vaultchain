import React, { useState, useContext } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import { UserStatus, KycDocumentType } from '../types';
import { ClockIcon, ExclamationTriangleIcon, DocumentArrowUpIcon } from '../components/ui/Icons';
import Card from '../components/ui/Card';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Return only the base64 part
                resolve(reader.result);
            } else {
                reject('Failed to convert blob to base64');
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const FileInput: React.FC<{ label: string; onFileSelect: (file: File) => void; preview: string | null; }> = ({ label, onFileSelect, preview }) => {
    const id = `file-${label.replace(/\s/g, '-')}`;
    return (
        <div>
            <label htmlFor={id} className="cursor-pointer block bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors">
                {preview ? (
                    <img src={preview} alt="Preview" className="h-24 mx-auto rounded-md object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-24">
                        <DocumentArrowUpIcon className="w-8 h-8 mx-auto text-gray-400" />
                        <span className="mt-2 block text-xs font-medium text-gray-900 dark:text-gray-300">{label}</span>
                    </div>
                )}
            </label>
            <input id={id} type="file" className="sr-only" accept="image/*" onChange={e => e.target.files && onFileSelect(e.target.files[0])} />
        </div>
    );
};

const KYCPage: React.FC<{ onCompletion: () => void }> = ({ onCompletion }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    
    type IdDocType = 'id' | 'license' | 'passport';
    const [idDocType, setIdDocType] = useState<IdDocType>('id');

    const [documents, setDocuments] = useState<Partial<Record<KycDocumentType, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!context || !context.user) return null;
    const { user, submitKycDocuments } = context;

    const handleFileChange = async (type: KycDocumentType, file: File) => {
        try {
            const base64 = await blobToBase64(file);
            setDocuments(prev => ({ ...prev, [type]: base64 }));
        } catch (error) {
            console.error("Error converting file to base64:", error);
        }
    };
    
    const handleSubmit = () => {
        setError('');
        setIsLoading(true);
        
        let requiredDocs: KycDocumentType[] = ['address_proof'];
        if (idDocType === 'id') requiredDocs.push('id_front', 'id_back');
        else if (idDocType === 'license') requiredDocs.push('license_front', 'license_back');
        else requiredDocs.push('passport');

        const allDocsPresent = requiredDocs.every(doc => !!documents[doc]);

        if (allDocsPresent) {
            // Convert to base64 string without data URI prefix for submission
            const submissionDocs: { [key: string]: string } = {};
            for (const key in documents) {
                const docKey = key as KycDocumentType;
                const dataUrl = documents[docKey];
                if (dataUrl) {
                     submissionDocs[docKey] = dataUrl;
                }
            }
            submitKycDocuments(submissionDocs);
            // The modal will show the pending state after this.
        } else {
            setError("Please upload all required documents.");
        }
        setIsLoading(false);
    };

    if (user.status === UserStatus.PENDING) {
        return (
            <div className="text-center p-4">
                <ClockIcon className="w-16 h-16 mx-auto text-yellow-500" />
                <h2 className="mt-4 text-2xl font-bold">{t('pendingReview')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('kycPendingMessage')}</p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    For support, please contact us on WhatsApp: <a href="https://wa.me/905074302420" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline font-semibold">+90 507 430 2420</a>
                </p>
            </div>
        );
    }
    
    // Form for UNVERIFIED or REJECTED
    return (
        <div className="space-y-6">
            {user.status === UserStatus.REJECTED && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-red-800 dark:text-red-300">{t('submissionRejected')}</h3>
                            <p className="text-sm text-red-700 dark:text-red-400">{user.kycRejectionReason || t('resubmitDocuments')}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div>
                <label className="block text-md font-semibold mb-2">{t('selectIdType')}</label>
                <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => setIdDocType('id')} className={`py-2 rounded-md font-semibold text-sm ${idDocType === 'id' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>{t('idCard')}</button>
                    <button onClick={() => setIdDocType('license')} className={`py-2 rounded-md font-semibold text-sm ${idDocType === 'license' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>{t('driversLicense')}</button>
                    <button onClick={() => setIdDocType('passport')} className={`py-2 rounded-md font-semibold text-sm ${idDocType === 'passport' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>{t('passport')}</button>
                </div>
            </div>

            <div className="space-y-4">
                {idDocType === 'id' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FileInput label={t('idFront')} onFileSelect={(f) => handleFileChange('id_front', f)} preview={documents.id_front || null} />
                        <FileInput label={t('idBack')} onFileSelect={(f) => handleFileChange('id_back', f)} preview={documents.id_back || null} />
                    </div>
                )}
                {idDocType === 'license' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FileInput label={t('licenseFront')} onFileSelect={(f) => handleFileChange('license_front', f)} preview={documents.license_front || null} />
                        <FileInput label={t('licenseBack')} onFileSelect={(f) => handleFileChange('license_back', f)} preview={documents.license_back || null} />
                    </div>
                )}
                {idDocType === 'passport' && <FileInput label={t('passportPage')} onFileSelect={(f) => handleFileChange('passport', f)} preview={documents.passport || null} />}
                
                 <div>
                    <h4 className="text-md font-semibold mb-2 mt-4">{t('proofOfAddress')}</h4>
                    <FileInput label={t('proofOfAddress')} onFileSelect={(f) => handleFileChange('address_proof', f)} preview={documents.address_proof || null} />
                </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                {isLoading ? t('submitting') : t('submitForVerification')}
            </button>
        </div>
    );
};

export default KYCPage;