import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { DashboardIcon, UsersIcon, DocumentArrowUpIcon, SwitchHorizontalIcon, SettingsIcon, ProfitIcon } from '../ui/Icons';

interface AdminBottomNavBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{item: any, isActive: boolean, onClick: () => void}> = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full h-full pt-2 pb-2 transition-all duration-200 group ${isActive ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'}`}
    >
        <div className={`p-1.5 rounded-full transition-all duration-200 ${isActive ? 'bg-green-500/10 dark:bg-green-400/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800/50'}`}>
           <item.icon className="w-5 h-5" />
        </div>
        <span className={`text-xs mt-0.5 font-medium transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
    </button>
);

const AdminBottomNavBar: React.FC<AdminBottomNavBarProps> = ({ activeView, setActiveView }) => {
    const { t } = useTranslation();

    const navItems = [
        { id: 'dashboard', label: t('dashboard'), icon: DashboardIcon },
        { id: 'users', label: t('userManagement'), icon: UsersIcon },
        { id: 'requests', label: t('pendingRequests'), icon: DocumentArrowUpIcon },
        { id: 'copy-trading', label: t('copyTradingManagement'), icon: SwitchHorizontalIcon },
        { id: 'profit-control', label: t('profitControl', { defaultValue: 'Profits' }), icon: ProfitIcon },
        { id: 'settings', label: t('settings'), icon: SettingsIcon },
    ];
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#062E1F] border-t border-gray-200 dark:border-green-400/20 grid grid-cols-6 justify-around items-center z-50 shadow-lg dark:shadow-black/20">
            {navItems.map((item) => (
                <NavItem
                    key={item.id}
                    item={item}
                    isActive={activeView === item.id}
                    onClick={() => setActiveView(item.id)}
                />
            ))}
        </nav>
    )
}

export default AdminBottomNavBar;