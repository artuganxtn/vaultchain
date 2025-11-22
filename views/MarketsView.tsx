

import React, { useState, useMemo, useContext } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import { CryptoAsset } from '../types';
import AssetCard from '../components/ui/AssetCard';
import AssetRow from '../components/ui/AssetRow';
import { SearchIcon, GridIcon, ListBulletIcon } from '../components/ui/Icons';

interface MarketsViewProps {
  setTradingViewSymbol: (symbol: string) => void;
  setActiveView: (view: string) => void;
}

type AssetCategory = 'All' | 'Crypto' | 'Forex' | 'Commodities' | 'Stocks';
type ViewMode = 'grid' | 'list';

const MarketsView: React.FC<MarketsViewProps> = ({ setTradingViewSymbol, setActiveView }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    const assets = context?.data?.assets || [];
    
    const [activeCategory, setActiveCategory] = useState<AssetCategory>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const categories: { id: AssetCategory; label: string }[] = [
        { id: 'All', label: t('all') },
        { id: 'Crypto', label: t('crypto') },
        { id: 'Forex', label: t('forex') },
        { id: 'Commodities', label: t('commodities') },
        { id: 'Stocks', label: t('stocks') },
    ];

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const matchesCategory = activeCategory === 'All' || asset.category === activeCategory;
            const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [assets, activeCategory, searchTerm]);

    const handleAssetClick = (asset: CryptoAsset) => {
        setTradingViewSymbol(asset.tradingViewSymbol);
        setActiveView('trading');
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4 space-y-4">
                 {/* Header with Search and View Toggle */}
                <div className="flex items-center justify-between gap-4">
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('markets')}</h2>
                     <div className="hidden sm:flex items-center gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}>
                            <GridIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}>
                            <ListBulletIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                        <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={t('searchAssets')}
                        className="block w-full p-3 ps-10 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/60 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Category Filters */}
                <div className="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-0 px-4 sm:px-0">
                    <div className="flex space-x-2 rtl:space-x-reverse pb-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                                    activeCategory === category.id
                                        ? 'bg-green-500 text-white shadow'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-grow min-h-0 overflow-y-auto scrollbar-hide -mx-4 sm:-mx-0">
                {filteredAssets.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-0">
                            {filteredAssets.map(asset => (
                                <AssetCard key={asset.id} asset={asset} onClick={() => handleAssetClick(asset)} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/80 dark:border-gray-700/50 rounded-2xl overflow-hidden mx-4 sm:mx-0">
                           {filteredAssets.map(asset => (
                                <AssetRow key={asset.id} asset={asset} onClick={() => handleAssetClick(asset)} />
                           ))}
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">{t('noAssetsFound')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketsView;