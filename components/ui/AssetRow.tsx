

import React from 'react';
import { CryptoAsset } from '../../types';
import * as Icons from './Icons';
import TradingViewSymbolOverviewWidget from './TradingViewSymbolOverviewWidget';

interface AssetRowProps {
    asset: CryptoAsset;
    onClick: () => void;
}

const AssetRow: React.FC<AssetRowProps> = ({ asset, onClick }) => {
    const IconComponent = (Icons as any)[asset.icon] || (() => {
        const text = asset.symbol.split('/')[0].replace(/[^A-Z€£¥₺]/g, '').substring(0, 2);
        const bgColor = asset.id.includes('eur') ? 'bg-blue-600' : asset.id.includes('gbp') ? 'bg-red-600' : 'bg-gray-500';
        return <Icons.TextIcon text={text} bgColor={bgColor} />;
    });

    return (
        <div
            onClick={onClick}
            className="flex items-center p-4 border-b border-gray-200/80 dark:border-gray-700/50 last:border-b-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-colors duration-200"
        >
            <IconComponent className="w-10 h-10 flex-shrink-0" />
            <div className="ms-4 flex-grow truncate">
                <p className="font-bold text-base text-gray-900 dark:text-white truncate">{asset.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol}</p>
            </div>
            <div className="w-48 h-12 flex-shrink-0">
                <TradingViewSymbolOverviewWidget asset={asset} />
            </div>
        </div>
    );
};

export default AssetRow;