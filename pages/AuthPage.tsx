import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import OTPVerificationPage from './OTPVerificationPage';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';

const AnimatedLogo = () => (
    <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
        <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full shadow-lg text-white font-bold text-4xl">
            V
        </div>
    </div>
);

const LanguageSwitcher = () => {
    const { language, setLanguage } = useTranslation();

    const getBtnClass = (lang: 'ar' | 'en' | 'tr') => {
        const base = "px-4 py-1.5 text-sm font-bold rounded-lg transition-all duration-300";
        if (language === lang) {
            return `${base} bg-white text-green-600 shadow-md`;
        }
        return `${base} text-white`;
    }

    return (
        <div className="absolute top-6 start-6 z-10 flex items-center gap-1 bg-white/20 p-1 rounded-xl backdrop-blur-sm">
            <button onClick={() => setLanguage('ar')} className={getBtnClass('ar')}>AR</button>
            <button onClick={() => setLanguage('en')} className={getBtnClass('en')}>EN</button>
            <button onClick={() => setLanguage('tr')} className={getBtnClass('tr')}>TR</button>
        </div>
    );
}

interface AuthPageProps {
    resetToken?: string | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ resetToken }) => {
    const [view, setView] = useState<'login' | 'signup' | 'forgotPassword' | 'otpVerification'>('login');
    const [otpEmail, setOtpEmail] = useState<string>('');
    const { t } = useTranslation();
    const context = React.useContext(AppContext);

    // If reset token is provided, show reset password page
    React.useEffect(() => {
        if (resetToken) {
            // Clear URL token after reading it
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/');
            }
        }
    }, [resetToken]);

    const handleOTPVerificationSuccess = (user: any) => {
        // OTP verified, user will be logged in automatically by App.tsx
        // Just close this view
        window.location.reload(); // Reload to trigger login state update
    };

    const renderView = () => {
        // Show reset password page if token is provided
        if (resetToken) {
            return <ResetPasswordPage token={resetToken} onSwitchToLogin={() => setView('login')} />;
        }

        // Show OTP verification page
        if (view === 'otpVerification' && otpEmail) {
            return (
                <OTPVerificationPage 
                    email={otpEmail} 
                    onVerificationSuccess={handleOTPVerificationSuccess}
                    onSwitchToLogin={() => setView('login')}
                />
            );
        }

        switch (view) {
            case 'signup':
                return (
                    <SignUpPage 
                        onSwitchToLogin={() => setView('login')}
                        onOTPRequired={(email) => {
                            setOtpEmail(email);
                            setView('otpVerification');
                        }}
                    />
                );
            case 'forgotPassword':
                return <ForgotPasswordPage onSwitchToLogin={() => setView('login')} />;
            case 'login':
            default:
                return <LoginPage onSwitchToSignUp={() => setView('signup')} onForgotPassword={() => setView('forgotPassword')} />;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="relative w-full max-w-7xl flex flex-col md:flex-row bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden min-h-[90vh]">
                <div className="relative w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center items-center text-center bg-gradient-to-br from-green-500 to-emerald-700 text-white">
                    <LanguageSwitcher />
                    <AnimatedLogo />
                    <h1 className="text-4xl font-bold mt-6 notranslate">
                        VaultChain
                    </h1>
                    <p className="mt-2 text-green-100">{t('loginSubtitle')}</p>
                </div>

                <div className="w-full md:w-3/5 p-8 md:p-16 flex items-center justify-center">
                    <div className="w-full max-w-md max-h-[80vh] overflow-y-auto scrollbar-hide">
                        {renderView()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;