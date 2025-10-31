
import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import * as api from '../services/api';
import { EyeIcon, EyeSlashIcon } from '../components/ui/Icons';

interface ForgotPasswordPageProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSwitchToLogin }) => {
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { t } = useTranslation();

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await api.requestPasswordReset(identifier);
            setIsLoading(false);
            if (result.success) {
                setSuccessMessage(t('resetLinkSentMessage') || 'Password reset link has been sent to your email. Please check your inbox.');
            } else {
                setError(t(result.error || 'userNotFound'));
            }
        } catch (err: any) {
            setIsLoading(false);
            setError(t('requestResetError') || 'Failed to send reset link. Please try again.');
        }
    };
    
    const inputClasses = "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-200/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm";

    if (successMessage) {
        return (
            <div className="w-full text-center">
                <div className="mb-4">
                    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('checkYourEmail') || 'Check Your Email'}</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 mb-6">
                    {successMessage}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    {t('clickLinkInEmail') || 'Click the link in the email to reset your password. The link will expire in 1 hour.'}
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
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t('enterEmailForResetLink') || "Enter your email address and we'll send you a link to reset your password."}
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleRequestReset}>
                <div>
                    <label htmlFor="reset-identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailOrUsername')}</label>
                    <input 
                        id="reset-identifier" 
                        type="text" 
                        required 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        className={inputClasses} 
                        disabled={isLoading} 
                        placeholder={t('emailOrUsernamePlaceholder') || 'Enter your email or username'}
                    />
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
                                {t('sending') || 'Sending...'}
                            </>
                        ) : (
                            t('sendResetLink') || 'Send Reset Link'
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

export default ForgotPasswordPage;
