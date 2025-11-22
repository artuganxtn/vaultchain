

import React from 'react';
import { UserRole } from '../../types';
import { DashboardIcon, TradingIcon, InvestmentIcon, UsersIcon, SettingsIcon } from '../ui/Icons';
import { useTranslation } from '../../contexts/LanguageContext';

interface SidebarProps {
  userRole: UserRole;
  activeView: string;
  setActiveView: (view: string) => void;
}


const NavItem: React.FC<{item: any, isActive: boolean, onClick: () => void}> = ({ item, isActive, onClick }) => (
    <li>
        <a
            href="#"
            onClick={onClick}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-green-500 text-white shadow-lg font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
        >
            <item.icon className="w-6 h-6" />
            <span className="ms-4 font-medium">{item.label}</span>
        </a>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ userRole, activeView, setActiveView }) => {
  const { t } = useTranslation();

  const commonNavItems = [
    { id: 'dashboard', label: t('dashboard'), icon: DashboardIcon },
  ];

  const userNavItems = [
    ...commonNavItems,
    { id: 'trading', label: t('trading'), icon: TradingIcon },
    { id: 'investment', label: t('investment'), icon: InvestmentIcon },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
  ];

  const adminNavItems = [
    ...commonNavItems,
    { id: 'users', label: t('userManagement'), icon: UsersIcon },
    { id: 'transactions', label: t('allTransactions'), icon: TradingIcon },
    { id: 'settings', label: t('systemSettings'), icon: SettingsIcon },
  ];

  const navItems = userRole === UserRole.USER ? userNavItems : adminNavItems;

  return (
    <aside className="w-64 h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-e border-gray-200 dark:border-gray-700 p-4 flex flex-col fixed">
      <div className="text-center py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          <span className="notranslate">
            <span className="text-green-500 dark:text-green-400">Vault</span>Chain
          </span>
        </h1>
      </div>
      <nav className="mt-8">
        <ul className="space-y-3">
          {navItems.map((item) => (
            <NavItem 
                key={item.id} 
                item={item} 
                isActive={activeView === item.id} 
                onClick={() => setActiveView(item.id)}
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4 text-center text-gray-500 dark:text-gray-500 text-xs">
          © 2024 <span className="notranslate">VaultChain</span>. {t('allRightsReserved')}
      </div>
    </aside>
  );
};

export default Sidebar;