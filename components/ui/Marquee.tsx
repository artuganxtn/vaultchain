
import React from 'react';
import { CryptoAsset } from '../../types';

interface MarqueeProps {
  assets: CryptoAsset[];
}

const MarqueeItem: React.FC<{ asset: CryptoAsset }> = ({ asset }) => {
  const isUp = asset.change24h >= 0;
  return (
    <div className="flex items-center space-x-4 rtl:space-x-reverse mx-6 flex-shrink-0">
      <span className="font-semibold text-sm">{asset.symbol}</span>
      <span className="font-mono text-sm">{asset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
      <span className={`text-sm font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
        {isUp ? '▲' : '▼'} {asset.change24h.toFixed(2)}%
      </span>
    </div>
  );
};

const Marquee: React.FC<MarqueeProps> = ({ assets }) => {
    const marqueeAssets = assets.filter(a => ['Crypto', 'Forex', 'Commodities'].includes(a.category)).slice(0, 15);

    const marqueeContent = marqueeAssets.map(asset => <MarqueeItem key={asset.id} asset={asset} />);

    return (
        <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700/50 py-3 overflow-hidden relative">
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                `}
            </style>
            <div className="w-full flex animate-marquee whitespace-nowrap">
                {marqueeContent}
                {marqueeContent} {/* Duplicate for seamless loop */}
            </div>
        </div>
    );
};

export default Marquee;
