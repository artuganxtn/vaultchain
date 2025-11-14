

import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import * as api from '../services/api';
import { EyeIcon, EyeSlashIcon } from '../components/ui/Icons';

interface ForgotPasswordPageProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSwitchToLogin }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { t } = useTranslation();

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        // Validate email format
        if (!email || !email.includes('@')) {
            setError(t('invalidEmail'));
            return;
        }

        setIsLoading(true);
        try {
            console.log('[ForgotPassword] Requesting password reset for:', email);
            const result = await api.requestPasswordReset(email);
            console.log('[ForgotPassword] Password reset request result:', result);
            setIsLoading(false);
            if (result.success) {
                setSuccessMessage(t('codeSentMessage'));
                setStep(2);
            } else {
                setError(t(result.error || 'serverError'));
            }
        } catch (err: any) {
            console.error('[ForgotPassword] Error requesting password reset:', err);
            setIsLoading(false);
            setError(err.message || t('serverError'));
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Validate OTP format (6 digits)
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            setError(t('invalidOrExpiredCode'));
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            setError(t('passwordsDontMatch'));
            return;
        }
        if (newPassword.length < 8) {
            setError(t('passwordLengthError'));
            return;
        }

        setIsLoading(true);
        try {
            console.log('[ForgotPassword] Resetting password for:', email);
            const result = await api.resetPasswordWithCode(email, code, newPassword);
            console.log('[ForgotPassword] Password reset result:', result);
            setIsLoading(false);
            if (result.success) {
                setSuccessMessage(t('passwordResetSuccess'));
                setStep(3);
                setTimeout(() => {
                    onSwitchToLogin();
                }, 3000);
            } else {
                setError(t(result.error || 'invalidOrExpiredCode'));
            }
        } catch (err: any) {
            console.error('[ForgotPassword] Error resetting password:', err);
            setIsLoading(false);
            setError(err.message || t('serverError'));
        }
    };
    
    const inputClasses = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white text-sm";

    if (successMessage && step === 3) {
         return (
            <div className="w-full text-center">
                 <div className="mb-6">
                     <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('passwordResetSuccess')}</h2>
                 </div>
                 <p className="mt-4 text-gray-600 dark:text-gray-400 mb-6">
                    {successMessage}
                </p>
                <div className="mt-6">
                    <button onClick={onSwitchToLogin} className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                        {t('backToLogin')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-start mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('resetYourPassword')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {step === 1 ? t('enterEmailForCode') : successMessage}
                </p>
            </div>

            {step === 1 && (
                <form className="space-y-6" onSubmit={handleRequestCode}>
                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailAddress')}</label>
                        <input 
                            id="reset-email" 
                            type="email" 
                            autoComplete="email"
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className={inputClasses} 
                            disabled={isLoading}
                            placeholder={t('emailAddress')}
                        />
                    </div>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                    {successMessage && <p className="text-green-500 dark:text-green-400 text-sm text-center">{successMessage}</p>}
                    <div className="pt-1">
                        <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('sendingCode')}
                                </>
                            ) : (
                                t('sendCode')
                            )}
                        </button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form className="space-y-4" onSubmit={handleResetPassword}>
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">{t('codeSentMessage')}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('enterEmailForCode')}</p>
                    </div>
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('verificationCode')}</label>
                        <input 
                            id="code" 
                            type="text" 
                            inputMode="numeric"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            required 
                            value={code} 
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setCode(value);
                            }} 
                            className={inputClasses} 
                            disabled={isLoading}
                            placeholder="000000"
                            aria-label={t('verificationCode')}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('verificationCode')} (6 {t('digits')})</p>
                    </div>
                     <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('newPassword')}</label>
                        <div className="relative">
                            <input id="new-password" type={showPassword ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputClasses} pe-12`} disabled={isLoading} />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 end-0 px-4 flex items-center text-gray-500 dark:text-gray-400">{showPassword ? <EyeSlashIcon /> : <EyeIcon />}</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirmNewPassword')}</label>
                         <div className="relative">
                            <input id="confirm-new-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={`${inputClasses} pe-12`} disabled={isLoading} />
                             <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 end-0 px-4 flex items-center text-gray-500 dark:text-gray-400">{showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}</button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                    <div className="pt-2">
                         <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('resettingPassword')}
                                </>
                            ) : (
                                t('resetPassword')
                            )}
                        </button>
                    </div>
                    <div className="text-center">
                        <button 
                            type="button" 
                            onClick={() => {
                                setStep(1);
                                setCode('');
                                setNewPassword('');
                                setConfirmNewPassword('');
                                setError('');
                                setSuccessMessage('');
                            }} 
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            disabled={isLoading}
                        >
                            {t('back')} / {t('resendCode')}
                        </button>
                    </div>
                </form>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                <button onClick={onSwitchToLogin} className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 focus:outline-none" disabled={isLoading}>
                    {t('backToLogin')}
                </button>
            </p>
        </div>
    );
};

export default ForgotPasswordPage;