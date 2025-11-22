import React from 'react';
import { CopyTrader } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import * as Icons from '../ui/Icons';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const StatItem: React.FC<{ icon: React.ReactElement<any>; label: string; value: string | number; color?: string }> = ({ icon, label, value, color }) => (
    <div className="flex flex-col items-center justify-center space-y-1 p-2 text-center">
        {React.cloneElement(icon, { className: `w-5 h-5 ${color || 'text-gray-500 dark:text-gray-400'}` })}
        <p className={`text-sm font-bold ${color || 'text-gray-900 dark:text-white'}`}>{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" opacity={(i < rating) ? 1 : 0.3} />
                </svg>
            ))}
        </div>
    );
};


const TraderCard: React.FC<{ trader: CopyTrader; onSelect: () => void; }> = ({ trader, onSelect }) => {
    const { t } = useTranslation();
    const IconComponent = (Icons as any)[trader.avatar] || Icons.UsersIcon;

    return (
        <div onClick={onSelect} className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-green-400/20 rounded-2xl p-4 shadow-md dark:shadow-lg space-y-3 cursor-pointer hover:shadow-xl hover:border-gray-300 dark:hover:border-green-400/40 transition-all duration-300">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-10 h-10 text-gray-800 dark:text-gray-200" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{trader.name}</h4>
                        {trader.id === 'trader_vc' && <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full">{t('Official')}</span>}
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                        <StarRating rating={trader.rating} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">({trader.rating})</span>
                    </div>
                </div>
                <div className="w-24 h-12">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trader.performanceHistory} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                             <defs>
                                <linearGradient id={`colorProfit-${trader.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill={`url(#colorProfit-${trader.id})`} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 border-t border-gray-200 dark:border-gray-700/50 pt-2">
                <StatItem icon={<Icons.ClockIcon />} label={t('monthlyProfit')} value={`${(trader.monthlyProfit * 100).toFixed(0)}%`} color="text-green-500 dark:text-green-400" />
                <StatItem icon={<Icons.ScaleIcon />} label={t('riskLevel')} value={t(trader.riskLevel)} />
                <StatItem icon={<Icons.TrophyIcon />} label={t('winRate')} value={`${trader.winRate}%`} />
                <StatItem icon={<Icons.UsersIcon />} label={t('followers')} value={trader.followers.toLocaleString()} />
            </div>
        </div>
    );
};

export default TraderCard;
