

import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import { EyeIcon, EyeSlashIcon, UserCircleIcon, AtSymbolIcon, EnvelopeIcon, MapPinIcon, GiftIcon, KeyIcon } from '../components/ui/Icons';
import { countries } from '../data/countries';

interface SignUpPageProps {
  onSwitchToLogin: () => void;
  onOTPRequired?: (email: string) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin, onOTPRequired }) => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [dialCode, setDialCode] = useState('+90');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('TR');
    const [address, setAddress] = useState('');
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
    
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Sanitize the username to only allow English letters and numbers
        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
        setUsername(sanitizedValue);
    };

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
        
        // Final check on submit, although real-time sanitization should prevent this.
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(username)) {
            setError(t('usernameInvalid'));
            return;
        }

        setIsLoading(true);
        
        const result = await context.signUp({
            fullName,
            username,
            email,
            password,
            phone: `${dialCode}${phone}`,
            country,
            address
        }, referralCode || undefined);
        
        if (result.success && result.email) {
            // Signup successful, OTP sent to email
            if (onOTPRequired) {
                onOTPRequired(result.email);
            }
        } else {
            // Error occurred
            setError(t(result.error || 'signUpError'));
        }
        
        setIsLoading(false);
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountryCode = e.target.value;
        const selectedCountry = countries.find(c => c.code === selectedCountryCode);
        if(selectedCountry) {
            setCountry(selectedCountry.code);
            setDialCode(selectedCountry.dial_code);
        }
    };

    const inputClasses = "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-200/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm";

    return (
        <div className="w-full">
            <div className="text-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('createYourAccount')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('startYourJourney')}</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fullName')}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input id="full-name" name="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${inputClasses} ps-10`} disabled={isLoading} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('username')}</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input id="username" name="username" type="text" required value={username} onChange={handleUsernameChange} className={`${inputClasses} ps-10`} disabled={isLoading} />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailAddress')}</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClasses} ps-10`} disabled={isLoading} />
                    </div>
                </div>
                
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phoneNumber')}</label>
                    <div className="relative">
                         <select
                            value={country}
                            onChange={handleCountryChange}
                            className="absolute inset-y-0 start-0 h-full bg-transparent border-0 border-e border-e-gray-300 dark:border-e-gray-600 rounded-s-md py-0 ps-3 pe-9 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500"
                            style={{ textAlignLast: 'center' }}
                        >
                            {countries.map(c => <option key={c.code} value={c.code}>{c.dial_code}</option>)}
                        </select>
                        <input id="phone" name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClasses} ps-28`} disabled={isLoading} />
                    </div>
                </div>

                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="address" name="address" type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputClasses} ps-10`} disabled={isLoading} />
                    </div>
                </div>

                <div>
                    <label htmlFor="referral-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('referralCode', { defaultValue: 'Referral Code (Optional)' })}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                            <GiftIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="referral-code" name="referralCode" type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className={`${inputClasses} ps-10`} disabled={isLoading} />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                            <KeyIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClasses} ps-10 pe-10`} disabled={isLoading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-500 dark:text-gray-400">
                          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirmPassword')}</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                            <KeyIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="confirm-password" name="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClasses} ps-10 pe-10`} disabled={isLoading} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-500 dark:text-gray-400">
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