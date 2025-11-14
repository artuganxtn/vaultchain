import React, { useState, useContext, useRef } from 'react';
import { BellIcon, LogoutIcon, SettingsIcon, GlobeAltIcon } from '../ui/Icons';
import { AppContext } from '../../App';
import { useTranslation } from '../../contexts/LanguageContext';
import { useClickOutside } from '../../hooks/useClickOutside';

interface HeaderProps {
    onMenuClick: () => void; // For settings panel
    onNotificationsClick: () => void;
    unreadCount: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNotificationsClick, unreadCount }) => {
    const context = useContext(AppContext);
    const { t, language, setLanguage } = useTranslation();

    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isLangOpen, setLangOpen] = useState(false);
    const profileRef = useRef(null);
    const langRef = useRef(null);
    
    useClickOutside(profileRef, () => setProfileOpen(false));
    useClickOutside(langRef, () => setLangOpen(false));

    if (!context || !context.user) return null;
    const { user, logout } = context;

    return (
        <header className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-20 h-16">
            {/* Left Side: Title */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    <span className="notranslate">
                        <span className="text-green-500 dark:text-green-400">Vault</span>Chain
                    </span>
                </h1>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse">
                {/* Language Dropdown */}
                <div ref={langRef} className="relative">
                    <button onClick={() => setLangOpen(!isLangOpen)} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <GlobeAltIcon className="h-6 w-6" />
                    </button>
                    {isLangOpen && (
                        <div className="absolute top-full mt-2 end-0 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-20">
                            <button onClick={() => { setLanguage('en'); setLangOpen(false); }} className={`w-full text-start px-4 py-2 text-sm ${language === 'en' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>{t('English')}</button>
                            <button onClick={() => { setLanguage('ar'); setLangOpen(false); }} className={`w-full text-start px-4 py-2 text-sm ${language === 'ar' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>{t('Arabic')}</button>
                            <button onClick={() => { setLanguage('tr'); setLangOpen(false); }} className={`w-full text-start px-4 py-2 text-sm ${language === 'tr' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>{t('Turkish')}</button>
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <button
                    onClick={onNotificationsClick}
                    className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Open notifications"
                >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        </span>
                    )}
                </button>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                    <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
                         <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                        </div>
                    </button>
                     {isProfileOpen && (
                        <div className="absolute top-full mt-2 end-0 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-20">
                            <div className="px-4 py-2 border-b dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                             <button onClick={() => { onMenuClick(); setProfileOpen(false); }} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <SettingsIcon className="w-5 h-5 me-3" />
                                {t('settings')}
                            </button>
                            <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                                <LogoutIcon className="w-5 h-5 me-3" />
                                {t('logout')}
                            </button>
                        </div>
                     )}
                </div>
            </div>
        </header>
    );
};

export default Header;