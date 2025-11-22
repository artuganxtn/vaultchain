import React, { useState, useContext, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import { UserStatus, KycDocumentType } from '../types';
import { ClockIcon, ExclamationTriangleIcon, DocumentArrowUpIcon } from '../components/ui/Icons';
import Card from '../components/ui/Card';

// Compress image before converting to base64
const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = reject;
            if (typeof e.target?.result === 'string') {
                img.src = e.target.result;
            } else {
                reject(new Error('Invalid file data'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

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

const FileInput: React.FC<{ 
    label: string; 
    onFileSelect: (file: File | null | undefined) => void; 
    preview: string | null;
    isUploading?: boolean;
}> = ({ label, onFileSelect, preview, isUploading = false }) => {
    const { t } = useTranslation();
    const id = `file-${label.replace(/\s/g, '-')}`;
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Trigger file input click
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    return (
        <div>
            <div 
                onClick={handleClick}
                onTouchStart={handleClick}
                className="cursor-pointer block bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors touch-manipulation active:bg-gray-200 dark:active:bg-gray-700"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center justify-center h-24">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="mt-2 block text-xs font-medium text-gray-900 dark:text-gray-300">{t('processing') || 'Processing...'}</span>
                    </div>
                ) : preview ? (
                    <img src={preview} alt="Preview" className="h-24 mx-auto rounded-md object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-24">
                        <DocumentArrowUpIcon className="w-8 h-8 mx-auto text-gray-400" />
                        <span className="mt-2 block text-xs font-medium text-gray-900 dark:text-gray-300">{label}</span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{t('maxFileSize') || 'Max 10MB'}</span>
                    </div>
                )}
            </div>
            <input 
                ref={fileInputRef}
                id={id} 
                type="file" 
                className="sr-only" 
                accept="image/*" 
                disabled={isUploading}
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                        onFileSelect(file);
                    }
                    // Reset input to allow selecting same file again
                    e.target.value = '';
                }} 
            />
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
    const [uploadingFiles, setUploadingFiles] = useState<Set<KycDocumentType>>(new Set());

    if (!context || !context.user) return null;
    const { user, submitKycDocuments } = context;

    const handleFileChange = async (type: KycDocumentType, file: File | null | undefined) => {
        if (!file) {
            console.error('[KYC] No file provided');
            return;
        }

        // Validate file size (max 10MB before compression)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            setError(t('fileTooLarge') || `File is too large. Maximum size is 10MB. Your file is ${fileSizeMB}MB. Please compress or resize the image.`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError(t('invalidFileType') || 'Please select an image file.');
            return;
        }

        setError('');
        setUploadingFiles(prev => new Set(prev).add(type));
        
        try {
            console.log('[KYC] Processing file...', { type, fileName: file.name, originalSize: file.size });
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('File conversion timeout. Please try a smaller file.')), 30000);
            });

            // Compress image before converting to base64
            const compressedBlob = await Promise.race([
                compressImage(file, 1920, 1920, 0.7), // Lower quality for smaller size
                timeoutPromise
            ]) as Blob;
            
            console.log('[KYC] Image compressed', { originalSize: file.size, compressedSize: compressedBlob.size, reduction: `${((1 - compressedBlob.size / file.size) * 100).toFixed(1)}%` });

            // Check compressed size (base64 is ~33% larger than binary)
            const maxBase64Size = 8 * 1024 * 1024; // 8MB for base64 (roughly 6MB binary)
            const estimatedBase64Size = compressedBlob.size * 1.33;
            if (estimatedBase64Size > maxBase64Size) {
                // Try more aggressive compression
                const moreCompressed = await compressImage(file, 1600, 1600, 0.6);
                const base64 = await blobToBase64(moreCompressed);
                if (base64.length > maxBase64Size) {
                    throw new Error(t('fileTooLarge') || `File is still too large after compression. Please use a smaller image (max 6MB after compression).`);
                }
                setDocuments(prev => ({ ...prev, [type]: base64 }));
                return;
            }

            // Convert compressed image to base64
            const base64 = await blobToBase64(compressedBlob);
            console.log('[KYC] File processed successfully', { type, base64Length: base64.length });
            
            setDocuments(prev => ({ ...prev, [type]: base64 }));
        } catch (error: any) {
            console.error('[KYC] Error processing file:', error);
            const errorMessage = error?.message || t('fileUploadFailed') || 'Failed to process file. Please try again.';
            setError(errorMessage);
            // Remove the failed document
            setDocuments(prev => {
                const updated = { ...prev };
                delete updated[type];
                return updated;
            });
        } finally {
            setUploadingFiles(prev => {
                const updated = new Set(prev);
                updated.delete(type);
                return updated;
            });
        }
    };
    
    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            // Check if user is logged in
            if (!user || !context) {
                setError(t('pleaseLogin') || 'Please log in to submit KYC documents.');
                setIsLoading(false);
                return;
            }

            let requiredDocs: KycDocumentType[] = ['address_proof'];
            if (idDocType === 'id') requiredDocs.push('id_front', 'id_back');
            else if (idDocType === 'license') requiredDocs.push('license_front', 'license_back');
            else requiredDocs.push('passport');

            const allDocsPresent = requiredDocs.every(doc => !!documents[doc]);

            if (!allDocsPresent) {
                setError(t('uploadAllDocuments') || "Please upload all required documents.");
                setIsLoading(false);
                return;
            }

            // Convert to base64 string without data URI prefix for submission
            const submissionDocs: { [key: string]: string } = {};
            for (const key in documents) {
                const docKey = key as KycDocumentType;
                const dataUrl = documents[docKey];
                if (dataUrl) {
                     submissionDocs[docKey] = dataUrl;
                }
            }

            console.log('[KYC] Submitting documents...', { userId: user.id, docCount: Object.keys(submissionDocs).length });
            await submitKycDocuments(submissionDocs);
            console.log('[KYC] Documents submitted successfully');
            
            // The modal will show the pending state after this.
        } catch (error: any) {
            console.error('[KYC] Submission error:', error);
            const errorMessage = error?.message || t('kycSubmissionFailed') || 'Failed to submit KYC documents. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIdDocType('id');
                        }}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIdDocType('id');
                        }}
                        className={`py-2 rounded-md font-semibold text-sm touch-manipulation ${idDocType === 'id' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}
                        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                    >
                        {t('idCard')}
                    </button>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIdDocType('license');
                        }}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIdDocType('license');
                        }}
                        className={`py-2 rounded-md font-semibold text-sm touch-manipulation ${idDocType === 'license' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}
                        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                    >
                        {t('driversLicense')}
                    </button>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIdDocType('passport');
                        }}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIdDocType('passport');
                        }}
                        className={`py-2 rounded-md font-semibold text-sm touch-manipulation ${idDocType === 'passport' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}
                        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                    >
                        {t('passport')}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {idDocType === 'id' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FileInput 
                            label={t('idFront')} 
                            onFileSelect={(f) => handleFileChange('id_front', f)} 
                            preview={documents.id_front || null}
                            isUploading={uploadingFiles.has('id_front')}
                        />
                        <FileInput 
                            label={t('idBack')} 
                            onFileSelect={(f) => handleFileChange('id_back', f)} 
                            preview={documents.id_back || null}
                            isUploading={uploadingFiles.has('id_back')}
                        />
                    </div>
                )}
                {idDocType === 'license' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FileInput 
                            label={t('licenseFront')} 
                            onFileSelect={(f) => handleFileChange('license_front', f)} 
                            preview={documents.license_front || null}
                            isUploading={uploadingFiles.has('license_front')}
                        />
                        <FileInput 
                            label={t('licenseBack')} 
                            onFileSelect={(f) => handleFileChange('license_back', f)} 
                            preview={documents.license_back || null}
                            isUploading={uploadingFiles.has('license_back')}
                        />
                    </div>
                )}
                {idDocType === 'passport' && (
                    <FileInput 
                        label={t('passportPage')} 
                        onFileSelect={(f) => handleFileChange('passport', f)} 
                        preview={documents.passport || null}
                        isUploading={uploadingFiles.has('passport')}
                    />
                )}
                
                 <div>
                    <h4 className="text-md font-semibold mb-2 mt-4">{t('proofOfAddress')}</h4>
                    <FileInput 
                        label={t('proofOfAddress')} 
                        onFileSelect={(f) => handleFileChange('address_proof', f)} 
                        preview={documents.address_proof || null}
                        isUploading={uploadingFiles.has('address_proof')}
                    />
                </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                }}
                onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isLoading) {
                        handleSubmit();
                    }
                }}
                disabled={isLoading} 
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-50 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
                {isLoading ? t('submitting') : t('submitForVerification')}
            </button>
        </div>
    );
};

export default KYCPage;
