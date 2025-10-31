import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import * as api from '../services/api';
import { EyeIcon, EyeSlashIcon } from '../components/ui/Icons';

interface ResetPasswordPageProps {
  token: string;
  onSwitchToLogin: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token, onSwitchToLogin }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const { t } = useTranslation();

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const result = await api.verifyResetToken(token);
                if (result.success && result.email) {
                    setUserEmail(result.email);
                    setIsVerifying(false);
                } else {
                    setError(t('invalidOrExpiredToken') || 'Invalid or expired reset link');
                    setIsVerifying(false);
                }
            } catch (err: any) {
                setError(t('invalidOrExpiredToken') || 'Invalid or expired reset link');
                setIsVerifying(false);
            }
        };

        if (token) {
            verifyToken();
        } else {
            setError(t('invalidToken') || 'No reset token provided');
            setIsVerifying(false);
        }
    }, [token, t]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
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
            const result = await api.resetPasswordWithToken(token, newPassword);
            setIsLoading(false);
            if (result.success) {
                setSuccessMessage(t('passwordResetSuccess') || 'Password reset successfully!');
                setTimeout(() => {
                    onSwitchToLogin();
                }, 3000);
            } else {
                setError(t(result.error || 'invalidOrExpiredToken'));
            }
        } catch (err: any) {
            setIsLoading(false);
            setError(t('passwordResetError') || 'Failed to reset password. Please try again.');
        }
    };
    
    const inputClasses = "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-200/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm";

    if (isVerifying) {
        return (
            <div className="w-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">{t('verifyingToken') || 'Verifying reset link...'}</p>
            </div>
        );
    }

    if (successMessage) {
        return (
            <div className="w-full text-center">
                <div className="mb-4">
                    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('passwordResetSuccess') || 'Success!'}</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 mb-6">
                    {successMessage}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    {t('redirectingToLogin') || 'Redirecting to login...'}
                </p>
                <button 
                    onClick={onSwitchToLogin} 
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                    {t('backToLogin') || 'Back to Login'}
                </button>
            </div>
        );
    }

    if (error && !userEmail) {
        return (
            <div className="w-full text-center">
                <div className="mb-4">
                    <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('invalidToken') || 'Invalid Reset Link'}</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 mb-6">
                    {error}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    {t('resetLinkExpiredMessage') || 'This password reset link has expired or is invalid. Please request a new one.'}
                </p>
                <button 
                    onClick={onSwitchToLogin} 
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                    {t('backToLogin') || 'Back to Login'}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-start mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('resetYourPassword') || 'Reset Your Password'}</h2>
                {userEmail && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {t('resettingPasswordFor') || 'Resetting password for:'} {userEmail}
                    </p>
                )}
            </div>

            <form className="space-y-6" onSubmit={handleResetPassword}>
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('newPassword')}</label>
                    <div className="relative">
                        <input 
                            id="new-password" 
                            type={showPassword ? 'text' : 'password'} 
                            required 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className={inputClasses} 
                            disabled={isLoading}
                            minLength={8}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-500 dark:text-gray-400"
                        >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirmPassword')}</label>
                    <div className="relative">
                        <input 
                            id="confirm-password" 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            required 
                            value={confirmNewPassword} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                            className={inputClasses} 
                            disabled={isLoading}
                            minLength={8}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                            className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-500 dark:text-gray-400"
                        >
                            {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}

                <div className="pt-1">
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 disabled:opacity-75"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('resettingPassword') || 'Resetting Password...'}
                            </>
                        ) : (
                            t('resetPassword') || 'Reset Password'
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <button 
                        type="button"
                        onClick={onSwitchToLogin} 
                        className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                    >
                        {t('backToLogin') || 'Back to Login'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordPage;

