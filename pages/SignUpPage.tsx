

import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import { EyeIcon, EyeSlashIcon } from '../components/ui/Icons';

interface SignUpPageProps {
  onSwitchToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(AppContext);
    const { t } = useTranslation();

    useEffect(() => {
        // Parse referral code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            setReferralCode(refCode);
        }
    }, []);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!context) return;
        
        if (password !== confirmPassword) {
            setError(t('passwordsDontMatch'));
            return;
        }
        if (password.length < 8) {
            setError(t('passwordLengthError'));
            return;
        }
        
        const derivedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        if (!derivedUsername) {
            setError(t('invalidEmail'));
            return;
        }

        setIsLoading(true);
        
        const result = await context.signUp({
            fullName,
            username: derivedUsername,
            email,
            password,
        }, referralCode || undefined);
        
        if (typeof result === 'string') {
             if (result === 'usernameExistsError') {
                 setError(t('usernameFromEmailExistsError', { defaultValue: 'This email is already associated with an account. Please try a different email or log in.' }));
             } else {
                 setError(t(result));
             }
        }
        // On success, the App component will automatically navigate to the dashboard
        
        setIsLoading(false);
    };

    const inputClasses = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white text-sm";

    return (
        <div className="w-full">
            <div className="text-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('createYourAccount')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('startYourJourney')}</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fullName')}</label>
                    <input id="full-name" name="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClasses} disabled={isLoading} />
                </div>

                <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailAddress')}</label>
                    <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} disabled={isLoading} />
                </div>

                <div>
                    <label htmlFor="referral-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('referralCode')}</label>
                    <input id="referral-code" name="referralCode" type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className={inputClasses} disabled={isLoading} />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                    <div className="relative">
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClasses} pe-12`} disabled={isLoading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 end-0 px-4 flex items-center text-gray-500 dark:text-gray-400">
                          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirmPassword')}</label>
                    <div className="relative">
                        <input id="confirm-password" name="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClasses} pe-12`} disabled={isLoading} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 end-0 px-4 flex items-center text-gray-500 dark:text-gray-400">
                          {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 dark:text-red-400 text-sm text-center pt-1">{error}</p>}

                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('creatingAccount')}
                            </>
                        ) : (
                            t('createAccount')
                        )}
                    </button>
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                    {t('alreadyHaveAccount')}{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 focus:outline-none disabled:opacity-75" disabled={isLoading}>
                        {t('signIn')}
                    </button>
                </p>
            </form>
        </div>
    );
};

export default SignUpPage;