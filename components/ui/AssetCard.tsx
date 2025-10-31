

import React from 'react';
import { CryptoAsset } from '../../types';
import * as Icons from './Icons';
import TradingViewSymbolOverviewWidget from './TradingViewSymbolOverviewWidget';

interface AssetCardProps {
    asset: CryptoAsset;
    onClick: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
    const IconComponent = (Icons as any)[asset.icon] || (() => {
        const text = asset.symbol.split('/')[0].replace(/[^A-Z€£¥₺]/g, '').substring(0, 2);
        const bgColor = asset.id.includes('eur') ? 'bg-blue-600' : asset.id.includes('gbp') ? 'bg-red-600' : 'bg-gray-500';
        return <Icons.TextIcon text={text} bgColor={bgColor} />;
    });

    return (
        <div 
            onClick={onClick} 
            className="cursor-pointer bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/80 dark:border-gray-700/50 rounded-2xl p-4 shadow-md dark:shadow-lg dark:shadow-black/20 hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
        >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <IconComponent className="w-10 h-10 flex-shrink-0" />
                <div className="truncate">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{asset.symbol}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{asset.name}</p>
                </div>
            </div>
            
            <div className="mt-4 text-start h-20">
                <TradingViewSymbolOverviewWidget asset={asset} />
            </div>
        </div>
    );
};

export default AssetCard;