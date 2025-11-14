
import React, { useState, useContext, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import { User, UserStatus } from '../types';
import { ReferralView } from '../views/ReferralView';
import ContactUsView from '../views/settings/ContactUsView';
import HelpCenterView from '../views/settings/HelpCenterView';
import PrivacyPolicyView from '../views/settings/PrivacyPolicyView';
import Modal from '../components/ui/Modal';
import {
    UserCircleIcon, ShieldCheckIcon, QuestionMarkCircleIcon, DocumentTextIcon,
    KeyIcon, GlobeAltIcon,
    ChatBubbleLeftRightIcon,
    ArrowLeftIcon, LogoutIcon, UsersIcon,
    CloseIcon,
    ComputerDesktopIcon,
    EyeIcon, EyeSlashIcon, ChevronRightIcon,
} from '../components/ui/Icons';
import ProfileView from '../views/settings/ProfileView';

const SettingsRow: React.FC<{ icon: React.ReactElement<any>, title: string, subtitle?: string, onClick?: () => void, children?: React.ReactNode, showChevron?: boolean }> = ({ icon, title, subtitle, onClick, children, showChevron = false }) => (
    <div onClick={onClick} className={`flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0 min-h-[72px] ${onClick ? 'cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30' : ''}`}>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {React.cloneElement(icon, { className: 'w-6 h-6 text-green-500 flex-shrink-0' })}
            <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-md">{title}</h4>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">{subtitle}</p>}
            </div>
        </div>
        <div className="flex-shrink-0 ps-2 flex items-center space-x-2 rtl:space-x-reverse">
            {children}
            {showChevron && <ChevronRightIcon className="text-gray-400" />}
        </div>
    </div>
);


// --- SECTIONS ---

const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) {
            setError(t('passwordsDontMatch'));
            return;
        }
        if (newPassword.length < 8) {
            setError(t('passwordLengthError'));
            return;
        }

        setIsLoading(true);
        const result = await context?.updatePassword(oldPassword, newPassword);
        setIsLoading(false);

        if (result) {
            setSuccess(t('passwordUpdatedSuccess'));
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);
        } else {
            setError(t('oldPasswordIncorrect'));
        }
    };
    
    const inputClasses = "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-200/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('changePassword')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('oldPassword')}</label>
                    <div className="relative">
                        <input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className={inputClasses} />
                         <button type="button" onClick={() => setShowOld(!showOld)} className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-500 dark:text-gray-400">{showOld ? <EyeSlashIcon /> : <EyeIcon />}</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('newPassword')}</label>
                     <div className="relative">
                        <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={inputClasses} />
                         <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-500 dark:text-gray-400">{showNew ? <EyeSlashIcon /> : <EyeIcon />}</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('confirmPassword')}</label>
                    <input type={showNew ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClasses} />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex justify-center items-center">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {t('updating')}
                            </>
                        ) : t('updatePassword')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ProfileHeader: React.FC<{ user: User }> = ({ user }) => {
    const { t } = useTranslation();
    const isVerified = user.status === UserStatus.VERIFIED;
    return (
        <div className="flex flex-col items-center text-center p-6 bg-gray-100 dark:bg-gray-800/30 rounded-2xl mb-6 border border-gray-200 dark:border-gray-700/50">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold mb-4 ring-4 ring-white/10 dark:ring-black/20">
                {user.name.charAt(0)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full ${isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                {isVerified ? t('Verified') : t('Unverified')}
            </div>
        </div>
    );
};

const MainSettingsView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    const { t, language, setLanguage } = useTranslation();
    const context = useContext(AppContext);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

    if (!context || !context.user) return null;
    const { user } = context;
    
    return (
        <>
            <div className="space-y-8">
                <ProfileHeader user={user} />
                
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">{t('account')}</h3>
                    <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl px-6">
                        <SettingsRow icon={<UserCircleIcon />} title={t('profileInfo')} subtitle={user.email} onClick={() => onNavigate('profile')} showChevron />
                        <SettingsRow icon={<UsersIcon />} title={t('referrals')} subtitle={t('referralLink')} onClick={() => onNavigate('referrals')} showChevron />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">{t('security')}</h3>
                    <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl px-6">
                        <SettingsRow icon={<KeyIcon />} title={t('changePassword')} subtitle="••••••••••••">
                            <button onClick={() => setPasswordModalOpen(true)} className="px-4 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg">{t('change')}</button>
                        </SettingsRow>
                         <SettingsRow icon={<ShieldCheckIcon />} title={t('twoFactorAuth')} subtitle={t('googleAuthOrSMS')}>
                            <span className="text-xs font-semibold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{t('comingSoon')}</span>
                        </SettingsRow>
                        <SettingsRow icon={<ComputerDesktopIcon />} title={t('activeSessions')} subtitle={t('activeSessionsDesc')}>
                            <span className="text-xs font-semibold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{t('comingSoon')}</span>
                        </SettingsRow>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">{t('application')}</h3>
                     <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl px-6">
                        <SettingsRow icon={<GlobeAltIcon />} title={t('language')} subtitle={t(language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : 'Turkish')}>
                            <div className="flex space-x-1 rtl:space-x-reverse bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                                <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm rounded-md ${language === 'en' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>EN</button>
                                <button onClick={() => setLanguage('ar')} className={`px-3 py-1 text-sm rounded-md ${language === 'ar' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>AR</button>
                                <button onClick={() => setLanguage('tr')} className={`px-3 py-1 text-sm rounded-md ${language === 'tr' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>TR</button>
                            </div>
                        </SettingsRow>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">{t('support')}</h3>
                     <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl px-6">
                        <SettingsRow icon={<QuestionMarkCircleIcon />} title={t('faq')} subtitle={t('faqDesc')} onClick={() => onNavigate('help')} showChevron />
                        <SettingsRow icon={<ChatBubbleLeftRightIcon />} title={t('contactUs')} subtitle={t('contactUsDesc')} onClick={() => onNavigate('contact')} showChevron />
                        <SettingsRow icon={<DocumentTextIcon />} title={t('privacyPolicy')} subtitle={t('privacyPolicyDesc')} onClick={() => onNavigate('privacy')} showChevron />
                    </div>
                </div>

                <div className="text-center pt-4">
                    <button onClick={() => context?.logout()} className="font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 flex items-center justify-center space-x-2 rtl:space-x-reverse mx-auto">
                        <LogoutIcon />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
        </>
    );
};


interface SettingsPageProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    const [activeView, setActiveView] = useState('main'); // 'main', 'profile', 'referrals', etc.

    const user = context?.user;
    const allUsers = context?.data?.users;

    // Reset to main view when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setActiveView('main');
            }, 300); // Delay to match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const renderContent = () => {
        if (!user || !allUsers) return null;
        switch (activeView) {
            case 'main':
                return <MainSettingsView onNavigate={setActiveView} />;
            case 'profile':
                return <ProfileView />;
            case 'referrals':
                return <ReferralView user={user} allUsers={allUsers} />;
            case 'contact':
                return <ContactUsView />;
            case 'help':
                return <HelpCenterView />;
            case 'privacy':
                return <PrivacyPolicyView />;
            default:
                return <MainSettingsView onNavigate={setActiveView} />;
        }
    };
    
    const getTitle = () => {
        switch(activeView) {
            case 'main': return t('settings');
            case 'profile': return t('profile');
            case 'referrals': return t('Referral Program');
            case 'contact': return t('contactUs');
            case 'help': return t('faq');
            case 'privacy': return t('privacyPolicy');
            default: return t('settings');
        }
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            
            <div 
                className={`fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-full max-w-lg bg-gray-100 dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-panel-title"
            >
                <header className="flex items-center space-x-4 rtl:space-x-reverse p-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                    {activeView !== 'main' && (
                        <button onClick={() => setActiveView('main')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <ArrowLeftIcon />
                        </button>
                    )}
                    <h2 id="settings-panel-title" className="text-xl font-bold text-gray-900 dark:text-white">{getTitle()}</h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ms-auto">
                        <CloseIcon />
                    </button>
                </header>
                <div className="flex-grow p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
