import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { BellIcon, LogoutIcon, GlobeAltIcon, SearchIcon } from '../ui/Icons';
import { AppContext } from '../../App';
import { useTranslation } from '../../contexts/LanguageContext';
import { useClickOutside } from '../../hooks/useClickOutside';

interface AdminHeaderProps {
    adminUser: User;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ adminUser, searchTerm, setSearchTerm }) => {
    const context = React.useContext(AppContext);
    const { t, language, setLanguage } = useTranslation();
    
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isLangOpen, setLangOpen] = useState(false);

    const profileRef = useRef(null);
    const langRef = useRef(null);
    
    useClickOutside(profileRef, () => setProfileOpen(false));
    useClickOutside(langRef, () => setLangOpen(false));

    return (
        <header className="bg-white dark:bg-[#062E1F] border-b border-gray-200 dark:border-green-400/20 h-16 flex-shrink-0">
            <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
                {/* Search Bar */}
                <div className="flex-1">
                    <div className="relative w-full max-w-[16rem] sm:max-w-xs text-gray-500 dark:text-gray-400 focus-within:text-gray-700 dark:focus-within:text-gray-200">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 rtl:left-auto rtl:right-0 rtl:pr-3">
                            <SearchIcon className="h-5 w-5" />
                        </div>
                        <input
                            id="search"
                            className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 py-2 pl-10 pr-3 rtl:pr-10 rtl:pl-3 leading-5 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder={t('searchByNameOrEmail', { defaultValue: 'Search users, tx,...' })}
                            type="search"
                            name="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <div ref={langRef} className="relative">
                        <button onClick={() => setLangOpen(!isLangOpen)} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
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

                    <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <BellIcon className="h-6 w-6" />
                    </button>

                    {/* Profile Dropdown */}
                    <div ref={profileRef} className="relative">
                        <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
                             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                                {adminUser.name.charAt(0)}
                            </div>
                        </button>
                         {isProfileOpen && (
                            <div className="absolute top-full mt-2 end-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-20">
                                <div className="px-4 py-2 border-b dark:border-gray-700">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{adminUser.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t(adminUser.role)}</p>
                                </div>
                                <button onClick={context?.logout} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <LogoutIcon className="w-5 h-5 me-2" />
                                    {t('logout')}
                                </button>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;