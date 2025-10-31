
import React, { useState, useContext, useMemo } from 'react';
import Card from '../components/ui/Card';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import { User, UserStatus } from '../types';
import { ReferralView } from '../views/ReferralView';
import ContactUsView from '../views/settings/ContactUsView';
import HelpCenterView from '../views/settings/HelpCenterView';
import PrivacyPolicyView from '../views/settings/PrivacyPolicyView';
import Modal from '../components/ui/Modal';
import {
    UserCircleIcon, CreditCardIcon, ShieldCheckIcon, QuestionMarkCircleIcon, DocumentTextIcon, SettingsIcon,
    CameraIcon,
    KeyIcon, DevicePhoneMobileIcon, FingerPrintIcon, GlobeAltIcon,
    ChatBubbleLeftRightIcon,
    TrashIcon, ArrowLeftIcon, LogoutIcon, UsersIcon,
    CloseIcon,
    ComputerDesktopIcon,
    EyeIcon, EyeSlashIcon, ChevronRightIcon,
} from '../components/ui/Icons';

const Toggle: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void, disabled?: boolean }> = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6 rtl:-translate-x-1' : 'translate-x-1'}`}
      />
    </button>
);

const SettingsRow: React.FC<{ icon: React.ReactElement<any>, title: string, subtitle?: string, onClick?: () => void, children?: React.ReactNode, showChevron?: boolean }> = ({ icon, title, subtitle, onClick, children, showChevron = false }) => (
    <div onClick={onClick} className={`flex items-center justify-between py-5 border-b border-gray-200 dark:border-gray-700 last:border-b-0 min-h-[80px] ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-6 px-6' : ''}`}>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {React.cloneElement(icon, { className: 'w-6 h-6 text-green-500 flex-shrink-0' })}
            <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-md">{title}</h4>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
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

const AccountInfoSection: React.FC<{ user: User | null }> = ({ user: userProp }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    // Use user from context if available, otherwise fall back to prop
    const user = context?.user || userProp;
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profileImage || null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Update preview when user from context changes
    React.useEffect(() => {
        if (context?.user?.profileImage !== undefined) {
            setProfileImagePreview(context.user.profileImage || null);
        }
    }, [context?.user?.profileImage]);
    
    if (!user) return null;

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    resolve(result);
                } else {
                    reject(new Error('Failed to convert blob to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert(t('pleaseSelectImage', { defaultValue: 'Please select an image file' }));
            return;
        }

        // Check file size (limit to 5MB for base64)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert(t('imageTooLarge', { defaultValue: 'Image is too large. Please select an image smaller than 5MB.' }));
            return;
        }

        try {
            const base64 = await blobToBase64(file);
            setProfileImagePreview(base64);
            
            // Update user with new profile image
            if (context?.updateUser) {
                const updatedUser = { ...user, profileImage: base64 };
                await context.updateUser(updatedUser);
                // Update the preview with the user from context to ensure consistency
                if (context.user && context.user.id === user.id) {
                    setProfileImagePreview(context.user.profileImage || base64);
                }
            }
        } catch (error) {
            console.error('Error converting image:', error);
            alert(t('imageUploadError', { defaultValue: 'Failed to upload image' }));
        }
    };

    const statusMap = {
        [UserStatus.VERIFIED]: { text: t('Verified'), color: 'text-green-500', bg: 'bg-green-500/10' },
        [UserStatus.PENDING]: { text: t('pendingReview'), color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        [UserStatus.UNVERIFIED]: { text: t('Unverified'), color: 'text-gray-500', bg: 'bg-gray-500/10' },
        [UserStatus.REJECTED]: { text: t('Rejected'), color: 'text-red-500', bg: 'bg-red-500/10' },
    };
    const userStatus = statusMap[user.status];

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('profile')}</h3>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 rtl:sm:space-x-reverse">
                <div className="relative">
                    {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-4xl font-bold text-gray-600 dark:text-gray-200">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 end-0 bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors"
                    >
                        <CameraIcon className="w-4 h-4" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                </div>
                <div className="flex-1 text-center sm:text-start">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
                    <span className={`mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full ${userStatus.bg} ${userStatus.color}`}>
                        {userStatus.text}
                    </span>
                </div>
            </div>
            <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('userID')}</span><span className="font-mono text-gray-800 dark:text-gray-200">{user.id}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-gray-400">{t('accountNumber')}</span><span className="font-mono text-gray-800 dark:text-gray-200">{user.accountNumber}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-gray-400">{t('walletAddress')}</span><span className="font-mono text-xs truncate max-w-[150px] sm:max-w-xs text-gray-800 dark:text-gray-200">{user.walletAddress}</span></div>
            </div>
        </Card>
    );
};

const FinanceSection: React.FC<{ onNavigate: (view: string) => void; onNavigateToWallet?: () => void; onClose?: () => void }> = ({ onNavigate, onNavigateToWallet, onClose }) => {
    const { t } = useTranslation();
    return (
        <Card>
            <SettingsRow icon={<CreditCardIcon />} title={t('paymentMethods')} subtitle="USDT (TRC20)">
                <button className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('manage')}</button>
            </SettingsRow>
             <SettingsRow icon={<DocumentTextIcon />} title={t('transactionHistory')} subtitle={t('depositsWithdrawalsProfits')} onClick={() => { 
                 if (onNavigateToWallet) {
                     onNavigateToWallet();
                 }
                 if (onClose) {
                     onClose();
                 }
             }} showChevron />
        </Card>
    );
};

const SecuritySection: React.FC<{ onChangePasswordClick: () => void }> = ({ onChangePasswordClick }) => {
    const { t } = useTranslation();
    return (
         <Card>
            <SettingsRow icon={<KeyIcon />} title={t('changePassword')} subtitle="••••••••••••">
                 <button onClick={onChangePasswordClick} className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg">{t('change')}</button>
            </SettingsRow>
            <SettingsRow icon={<DevicePhoneMobileIcon />} title={t('twoFactorAuth')} subtitle={t('googleAuthOrSMS')}>
                 <button disabled className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">{t('enable')}</button>
            </SettingsRow>
             <SettingsRow icon={<FingerPrintIcon />} title={t('biometricAuth')} subtitle={t('biometricAuthDesc')}>
                <Toggle enabled={false} onChange={() => {}} disabled />
            </SettingsRow>
             <SettingsRow icon={<ComputerDesktopIcon />} title={t('activeSessions')} subtitle={t('activeSessionsDesc')}>
                 <button disabled className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">{t('manage')}</button>
            </SettingsRow>
        </Card>
    )
};

const PreferencesSection: React.FC = () => {
    const { t, language, setLanguage } = useTranslation();
    return (
        <Card>
            <SettingsRow icon={<GlobeAltIcon />} title={t('language')} subtitle={t(language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : 'Turkish')}>
                <div className="flex space-x-1 rtl:space-x-reverse bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm rounded-md ${language === 'en' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>EN</button>
                    <button onClick={() => setLanguage('ar')} className={`px-3 py-1 text-sm rounded-md ${language === 'ar' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>AR</button>
                    <button onClick={() => setLanguage('tr')} className={`px-3 py-1 text-sm rounded-md ${language === 'tr' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>TR</button>
                </div>
            </SettingsRow>
        </Card>
    )
};

const MainSettingsPlaceholder: React.FC<{ user: User }> = ({ user }) => {
    const { t } = useTranslation();
    return (
        <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-300 mb-4">
                {user.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {t('welcome', { defaultValue: 'Welcome' })}, {user.name}!
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t('selectCategoryToStart', { defaultValue: 'Select a category from the menu to get started.' })}
            </p>
        </div>
    );
};

const SettingsPage: React.FC<{ isOpen: boolean; onClose: () => void; onNavigateToWallet?: () => void }> = ({ isOpen, onClose, onNavigateToWallet }) => {
    const { t } = useTranslation();
    const [currentView, setCurrentView] = useState('main');
    const context = useContext(AppContext);
    const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
    
    const settingsSections = useMemo(() => ({
        main: { id: 'main', title: t('settings'), icon: <SettingsIcon />, Component: () => <MainSettingsPlaceholder user={context?.user!} /> },
        account: { id: 'account', title: t('accountInfo'), icon: <UserCircleIcon />, Component: () => <AccountInfoSection user={context?.user ?? null} /> },
        referrals: { id: 'referrals', title: t('referrals'), icon: <UsersIcon />, Component: () => <ReferralView user={context?.user!} allUsers={context?.data?.users!} /> },
        finance: { id: 'finance', title: t('financeAndTransactions'), icon: <CreditCardIcon />, Component: () => <FinanceSection onNavigate={setCurrentView} onNavigateToWallet={onNavigateToWallet} onClose={handleClose} /> },
        security: { id: 'security', title: t('security'), icon: <ShieldCheckIcon />, Component: () => <SecuritySection onChangePasswordClick={() => setChangePasswordOpen(true)} /> },
        preferences: { id: 'preferences', title: t('appPreferences'), icon: <SettingsIcon />, Component: PreferencesSection },
        support: { id: 'support', title: t('supportAndHelp'), icon: <QuestionMarkCircleIcon />, Component: () => 
            <Card>
                <SettingsRow icon={<ChatBubbleLeftRightIcon />} title={t('contactUs')} onClick={() => setCurrentView('contact')} showChevron />
                <SettingsRow icon={<QuestionMarkCircleIcon />} title={t('faq')} onClick={() => setCurrentView('help')} showChevron />
            </Card>
        },
        legal: { id: 'legal', title: t('legalAndPrivacy'), icon: <DocumentTextIcon />, Component: () => 
            <Card>
                <SettingsRow icon={<DocumentTextIcon />} title={t('privacyPolicy')} onClick={() => setCurrentView('privacy')} showChevron />
                <SettingsRow icon={<TrashIcon />} title={t('deleteAccount')} subtitle={t('deleteAccountDesc')}>
                    <button disabled className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">{t('delete')}</button>
                </SettingsRow>
            </Card>
        },
        contact: { id: 'contact', title: t('contactUs'), icon: <ChatBubbleLeftRightIcon />, Component: ContactUsView },
        help: { id: 'help', title: t('faq'), icon: <QuestionMarkCircleIcon />, Component: HelpCenterView },
        privacy: { id: 'privacy', title: t('privacyPolicy'), icon: <DocumentTextIcon />, Component: PrivacyPolicyView },
    }), [t, context?.user, context?.data?.users]);
    
    const navStructure = useMemo(() => [
        { title: t('account', { defaultValue: 'Account' }), items: ['account', 'referrals'] },
        { title: t('application', { defaultValue: 'Application' }), items: ['security', 'preferences'] },
        { title: t('general', { defaultValue: 'General' }), items: ['finance', 'support', 'legal'] },
    ], [t]);
    
    const handleClose = () => {
        setCurrentView('main');
        onClose();
    };

    const handleMobileBack = () => {
        if (['contact', 'help'].includes(currentView)) {
            setCurrentView('support');
        } else if (['privacy'].includes(currentView)) {
            setCurrentView('legal');
        } else if (currentView !== 'main') {
            setCurrentView('main');
        }
    };
    
    if (!context || !context.user) return null;
    
    const CurrentComponent = settingsSections[currentView as keyof typeof settingsSections]?.Component;
    const currentTitle = currentView === 'main' ? t('settings') : settingsSections[currentView as keyof typeof settingsSections]?.title;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                     <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-200">
                            {context.user!.name.charAt(0)}
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{context.user!.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{context.user!.email}</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-4">
                {navStructure.map(group => (
                    <div key={group.title}>
                        <h4 className="px-3 pb-2 text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">{group.title}</h4>
                        <div className="space-y-1">
                            {group.items.map(itemId => {
                                const section = settingsSections[itemId as keyof typeof settingsSections];
                                if (!section) return null;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setCurrentView(section.id)}
                                        className={`w-full flex items-center space-x-3 rtl:space-x-reverse text-start p-3 rounded-lg transition-colors ${currentView === section.id ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                    >
                                        {React.cloneElement(section.icon, { className: 'w-6 h-6 flex-shrink-0' })}
                                        <span>{section.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => { context?.logout(); onClose(); }}
                    className="w-full flex items-center space-x-3 rtl:space-x-reverse text-start p-3 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                >
                    <LogoutIcon className="w-6 h-6" />
                    <span>{t('logout')}</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className={`fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}>
                <header className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 h-16 flex-shrink-0">
                     <div className="flex items-center space-x-2 rtl:space-x-reverse w-1/3">
                         <button onClick={handleMobileBack} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden">
                            <ArrowLeftIcon className={`w-6 h-6 transition-opacity ${currentView === 'main' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
                        </button>
                     </div>
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center flex-1 truncate">{currentTitle}</h2>
                     <div className="flex justify-end w-1/3">
                        <button onClick={handleClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                     </div>
                </header>
                
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto md:flex md:space-x-6 rtl:md:space-x-reverse md:p-6">
                        <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
                             <div className="bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm h-full sticky top-24">
                                <SidebarContent />
                             </div>
                        </aside>

                        <div className="flex-1 min-w-0">
                            <div className={`p-4 sm:p-0 md:p-0 md:hidden ${currentView !== 'main' ? 'hidden' : 'block'}`}>
                                {navStructure.map(group => (
                                    <Card key={group.title} className="mb-6">
                                        <h3 className="px-6 pt-2 pb-0 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{group.title}</h3>
                                        {group.items.map(itemId => {
                                            const section = settingsSections[itemId as keyof typeof settingsSections];
                                            if (!section) return null;
                                            return (
                                                <SettingsRow 
                                                    key={section.id} 
                                                    icon={section.icon} 
                                                    title={section.title} 
                                                    onClick={() => setCurrentView(section.id)}
                                                    showChevron={true}
                                                />
                                            );
                                        })}
                                    </Card>
                                ))}
                                <Card className="mt-6">
                                    <SettingsRow 
                                        icon={<LogoutIcon />}
                                        title={t('logout')}
                                        onClick={() => { context?.logout(); onClose(); }}
                                    />
                                </Card>
                            </div>
                            
                            <div className={`p-4 sm:p-0 md:p-0 ${currentView === 'main' && 'hidden'} md:block`}>
                                 {CurrentComponent && <CurrentComponent />}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
        </>
    );
};

export default SettingsPage;
