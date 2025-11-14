




import React from 'react';
import { CryptoAsset } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import * as Icons from './Icons';
import Card from './Card';
import TradingViewWidget from './TradingViewWidget';
import TradingViewSymbolOverviewWidget from './TradingViewSymbolOverviewWidget';

interface AssetChartProps {
    asset: CryptoAsset;
    onBack: () => void;
    onTrade: () => void;
}

const AssetChart: React.FC<AssetChartProps> = ({ asset, onBack, onTrade }) => {
    const { t } = useTranslation();
    
    const IconComponent = (Icons as any)[asset.icon] || (() => {
        const text = asset.symbol.split('/')[0].replace(/[^A-Z€£¥₺]/g, '').substring(0,2);
        const bgColor = asset.id.includes('eur') ? 'bg-blue-600' : asset.id.includes('gbp') ? 'bg-red-600' : 'bg-gray-500';
        return <Icons.TextIcon text={text} bgColor={bgColor} />;
    });


    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/50">
                    <Icons.ArrowLeftIcon />
                </button>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <IconComponent />
                    <div>
                        <h2 className="text-xl font-bold">{asset.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol}</p>
                    </div>
                </div>
            </div>

            <Card>
                <div className="flex justify-between items-start">
                    <div className="w-64 h-20"><TradingViewSymbolOverviewWidget asset={asset} /></div>
                    <button onClick={onTrade} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">{t('trade')}</button>
                </div>
                <div className="h-96 mt-4">
                   <TradingViewWidget symbol={asset.tradingViewSymbol} isAdvanced={true} />
                </div>
            </Card>
        </div>
    );
};

export default AssetChart;
