import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

// FIX: Changed icon prop type to React.ReactElement<any> to allow passing className via cloneElement.
const StatCard: React.FC<{ title: string, value: string, icon: React.ReactElement<any> }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center space-x-4 rtl:space-x-reverse">
        <div className="bg-green-500/10 dark:bg-green-500/20 p-3 rounded-full">
            {React.cloneElement(icon, { className: "w-6 h-6 text-green-500 dark:text-green-400" })}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default StatCard;