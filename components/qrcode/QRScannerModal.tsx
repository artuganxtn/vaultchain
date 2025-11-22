import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import { useTranslation } from '../../contexts/LanguageContext';
import { CameraIcon, DocumentArrowUpIcon } from '../ui/Icons';

declare const Html5Qrcode: any;

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
    const { t } = useTranslation();
    const [scanMode, setScanMode] = useState<'camera' | 'file' | null>(null);
    const [error, setError] = useState('');
    const html5QrCodeRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

    const onScanSuccess = (decodedText: string) => {
        stopScanner();
        onScan(decodedText);
    };

    const onScanFailure = (errorMessage: string) => {
        // This can be noisy, so we might not want to log everything.
    };

    const startCameraScanner = () => {
        setScanMode('camera');
        setError('');
        const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return {
                width: qrboxSize,
                height: qrboxSize,
            };
        };

        const config = { fps: 10, qrbox: qrboxFunction };
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanFailure
            ).catch((err: any) => {
                setError(t('cameraError', { defaultValue: "Could not start camera. Please check permissions."}));
                console.error("Camera start error:", err);
            });
        }
    };
    
    const stopScanner = () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch((err: any) => {
                console.error("Error stopping the scanner:", err);
            });
        }
    };

    const handleRequestCamera = () => {
        setShowPermissionPrompt(false);
        startCameraScanner();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                // The library needs a DOM element to be initialized.
                // We ensure it's initialized before trying to use scanFile.
                if (!html5QrCodeRef.current) {
                     html5QrCodeRef.current = new Html5Qrcode("reader-container", { verbose: false });
                }
                const decodedText = await html5QrCodeRef.current.scanFile(file, false); // showImage = false
                onScanSuccess(decodedText);
            } catch (err: any) {
                setError(t('scanError', { defaultValue: 'Scan Error: Could not decode QR code from image.'}));
                console.error(err);
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
             // The element must exist in the DOM before initialization.
            // We give it a moment to render.
            setTimeout(() => {
                 if (document.getElementById("reader-container") && !html5QrCodeRef.current) {
                    html5QrCodeRef.current = new Html5Qrcode("reader-container", { verbose: false });
                 }
            }, 100);
        }
        
        // Cleanup on unmount or when modal closes
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                stopScanner();
            }
            html5QrCodeRef.current = null;
            setScanMode(null);
            setError('');
            setShowPermissionPrompt(false);
        };
    }, [isOpen]);

    const handleClose = () => {
        stopScanner();
        setScanMode(null);
        setError('');
        setShowPermissionPrompt(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('qrScanner')} size="sm">
            <div className="space-y-4">
                <div 
                    id="reader-container-parent" 
                    className={`relative w-full ${scanMode ? 'aspect-square bg-gray-900' : ''} rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300`}
                    style={{ minHeight: scanMode ? 'auto' : '200px' }}
                >
                    <div id="reader-container" className="w-full h-full"></div>

                    {scanMode === 'camera' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[70%] h-[70%] border-4 border-white/50 rounded-2xl shadow-[0_0_0_4000px_rgba(0,0,0,0.5)]"></div>
                        </div>
                    )}

                    {!scanMode && !showPermissionPrompt && (
                        <div className="w-full flex flex-col items-center justify-center gap-4 p-2">
                            <button
                                onClick={() => setShowPermissionPrompt(true)}
                                className="w-full flex items-center justify-center p-4 gap-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                <CameraIcon className="w-6 h-6"/>
                                <span className="font-bold text-lg">{t('scanWithCamera')}</span>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center p-4 gap-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                <DocumentArrowUpIcon className="w-6 h-6"/>
                                <span className="font-bold text-lg">{t('uploadImage')}</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    )}

                    {showPermissionPrompt && (
                        <div className="w-full flex flex-col items-center justify-center gap-4 p-6 text-center">
                            <div className="p-4 bg-green-500/20 rounded-full">
                                <CameraIcon className="w-10 h-10 text-green-500 dark:text-green-300"/>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{t('cameraAccessRequired')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{t('cameraAccessMessage')}</p>
                            <div className="flex w-full gap-4 mt-4">
                                <button onClick={() => setShowPermissionPrompt(false)} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-600/50 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">{t('cancel')}</button>
                                <button onClick={handleRequestCamera} className="flex-1 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600">{t('allow')}</button>
                            </div>
                        </div>
                    )}
                </div>

                {error && <p className="text-center text-sm text-red-500">{error}</p>}
                
                {scanMode === 'camera' && <button onClick={handleClose} className="w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold">{t('cancel')}</button>}
            </div>
        </Modal>
    );
};

export default QRScannerModal;