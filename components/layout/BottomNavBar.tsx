import React from 'react';
import { TradingIcon, WalletIcon, MarketsIcon, PositionsIcon, InvestmentIcon } from '../ui/Icons';
import { useTranslation } from '../../contexts/LanguageContext';

interface BottomNavBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{item: any, isActive: boolean, onClick: () => void}> = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-200 ${isActive ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
    >
        <item.icon className="w-6 h-6" />
        <span className="text-xs mt-1">{item.label}</span>
        {isActive && <div className="w-8 h-1 bg-green-400 rounded-full mt-1"></div>}
    </button>
);


const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'wallet', label: t('wallet'), icon: WalletIcon },
    { id: 'markets', label: t('markets'), icon: MarketsIcon },
    { id: 'trading', label: t('trading'), icon: TradingIcon },
    { id: 'investment', label: t('staking'), icon: InvestmentIcon },
    { id: 'copy-trading', label: t('copyTrading'), icon: PositionsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 flex justify-around items-center z-20">
      {navItems.map((item) => (
        <NavItem
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            onClick={() => setActiveView(item.id)}
        />
      ))}
    </nav>
  );
};

export default BottomNavBar;