import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import * as api from '../services/api';
import { CheckCircleIcon, XCircleIcon } from '../components/ui/Icons';

interface OTPVerificationPageProps {
    email: string;
    onVerificationSuccess: (user: any) => void;
    onSwitchToLogin?: () => void;
}

const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({ email, onVerificationSuccess, onSwitchToLogin }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0); // Countdown for resend button
    const { t } = useTranslation();
    const context = useContext(AppContext);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Start countdown timer (2 minutes) - restarts when countdown changes from 0
    useEffect(() => {
        if (countdown <= 0) return;
        
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);
    
    // Initialize countdown on mount
    useEffect(() => {
        if (countdown === 0) {
            setCountdown(120); // 2 minutes
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOTPChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then((text) => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                if (digits.length === 6) {
                    const newOtp = [...digits];
                    setOtp(newOtp);
                    inputRefs.current[5]?.focus();
                }
            });
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError(t('enterCompleteOTP') || 'Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            if (!context?.verifyOTP) {
                setError(t('verificationError') || 'Verification service unavailable. Please try again.');
                setIsLoading(false);
                return;
            }
            
            const result = await context.verifyOTP(email, otpString);
            if (result.success && result.user) {
                setSuccess(true);
                setTimeout(() => {
                    onVerificationSuccess(result.user!);
                }, 1500);
            } else {
                setError(t(result.error || 'invalidOTP') || 'Invalid or expired OTP. Please try again.');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err: any) {
            setError(t('otpVerificationError') || 'Failed to verify OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0 || isResending) return;

        setIsResending(true);
        setError('');
        
        try {
            const result = await api.resendOTP(email);
            if (result.success) {
                setOtp(['', '', '', '', '', '']);
                setCountdown(120); // Reset countdown to 2 minutes
                inputRefs.current[0]?.focus();
                // Countdown timer will be managed by the useEffect that already exists
            } else {
                setError(t('resendOTPError') || 'Failed to resend OTP. Please try again.');
            }
        } catch (err: any) {
            setError(t('resendOTPError') || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        if (otp.every(digit => digit !== '') && !isLoading && !success && otp.join('').length === 6) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp]);

    if (success) {
        return (
            <div className="w-full text-center">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-12 h-12 text-green-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('emailVerified') || 'Email Verified!'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('accountActivated') || 'Your account has been successfully activated. Redirecting...'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-start mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('verifyYourEmail') || 'Verify Your Email'}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t('otpSentToEmail') || "We've sent a 6-digit verification code to"}
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white text-lg">
                    {email}
                </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                        {t('enterVerificationCode') || 'Enter Verification Code'}
                    </label>
                    <div className="flex justify-center gap-3" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOTPChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                disabled={isLoading || success}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400 text-sm">
                        <XCircleIcon className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading || otp.some(d => !d)}
                        className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('verifying') || 'Verifying...'}
                            </>
                        ) : (
                            t('verifyEmail') || 'Verify Email'
                        )}
                    </button>
                </div>

                <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('didntReceiveCode') || "Didn't receive the code?"}
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || isResending || isLoading}
                        className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isResending ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('sending') || 'Sending...'}
                            </span>
                        ) : countdown > 0 ? (
                            `${t('resendOTPIn') || 'Resend code in'} ${formatTime(countdown)}`
                        ) : (
                            t('resendOTP') || 'Resend Code'
                        )}
                    </button>
                </div>

                {onSwitchToLogin && (
                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            {t('backToLogin') || 'Back to Login'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default OTPVerificationPage;

