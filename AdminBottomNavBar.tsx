

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
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-200 group ${isActive ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
    >
        <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-green-400/20' : ''}`}>
           <item.icon className="w-6 h-6" />
        </div>
        <span className="text-xs mt-1 font-medium">{item.label}</span>
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
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-[#062E1F] border-t border-gray-200 dark:border-green-400/20 grid grid-cols-6 justify-around items-start z-30">
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