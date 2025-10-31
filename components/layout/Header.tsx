import React from 'react';
import { MenuIcon, SunIcon, MoonIcon } from '../ui/Icons';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10 h-16">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <span className="notranslate">
            <span className="text-green-500 dark:text-green-400">Vault</span>Chain
          </span>
        </h1>
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          aria-label="Open Settings"
        >
          <MenuIcon className="w-6 h-6"/>
        </button>
      </div>
    </header>
  );
};

export default Header;