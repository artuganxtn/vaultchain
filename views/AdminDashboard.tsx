import React, { useContext, useState, useEffect, useMemo } from 'react';
import { getAdminKpis } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { UsersIcon, ShieldCheckIcon, CurrencyDollarIcon, ClockIcon, DocumentArrowUpIcon, ExclamationTriangleIcon } from '../components/ui/Icons';
import { AppContext } from '../App';
import { KpiData, User } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLocaleFromLanguage, formatCurrency, formatDateTime } from '../utils/locale';

interface KPICardProps {
    icon: React.ReactElement<any>;
    title: string;
    value: string;
    gradient: string;
    breakdown?: { label: string; value: string }[];
}

const KPICard: React.FC<KPICardProps> = ({ icon, title, value, gradient, breakdown }) => {
    return (
        <div className={`relative p-5 rounded-2xl overflow-hidden text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${gradient}`}>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full opacity-50 blur-xl" />
            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/80">{title}</h3>
                    <div className="text-white/80">{React.cloneElement(icon, { className: "w-6 h-6" })}</div>
                </div>
                <p className="text-3xl font-bold mt-2">{value}</p>
                 {breakdown && (
                    <div className="mt-3 pt-2 border-t border-white/20 space-y-1 text-xs">
                        {breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-white/70">{item.label}</span>
                                <span className="font-semibold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const processSignupData = (users: User[], language: string) => {
    const locale = getLocaleFromLanguage(language);
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const signupCounts = last7Days.reduce((acc, day) => {
        acc[day] = 0;
        return acc;
    }, {} as Record<string, number>);

    users.forEach(user => {
        const signupDay = user.createdAt.split('T')[0];
        if (signupCounts[signupDay] !== undefined) {
            signupCounts[signupDay]++;
        }
    });

    return last7Days.map(day => ({
        name: new Date(day).toLocaleDateString(locale, { weekday: 'short' }),
        signups: signupCounts[day],
    }));
};


export const AdminDashboardView: React.FC = () => {
    const { t, language } = useTranslation();
    const context = useContext(AppContext);
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const locale = getLocaleFromLanguage(language);

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const data = await getAdminKpis();
                if (data) {
                    setKpis(data);
                }
            } catch (error) {
                console.error('[AdminDashboard] Error fetching KPIs:', error);
            }
        };
        fetchKpis();
    }, [context?.data]);
    
    if (!context || !context.data) return null;
    const { auditLogs, users } = context.data;
    
    const signupData = useMemo(() => processSignupData(users, language), [users, language]);

    if (!kpis) {
        return <div className="flex justify-center items-center h-64"><div className="text-gray-500 dark:text-gray-400">{t('loading', { defaultValue: 'Loading...' })}</div></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminOverview')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('platformHealth')}</p>
            </div>
            
             <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('platformOverview')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <KPICard 
                        icon={<UsersIcon />}
                        title={t('totalUsers')} 
                        value={kpis.totalUsers.toString()}
                        gradient="bg-gradient-to-br from-purple-600 to-indigo-500"
                    />
                    <KPICard 
                        icon={<UsersIcon />}
                        title={t('sessionsActiveNow')} 
                        value={kpis.sessionsActiveNow.toString()}
                        gradient="bg-gradient-to-br from-pink-500 to-rose-400"
                    />
                    <KPICard 
                        icon={<CurrencyDollarIcon />}
                        title={t('totalPlatformBalance')} 
                        value={formatCurrency(kpis.totalPlatformBalance, locale)}
                        gradient="bg-gradient-to-br from-blue-500 to-cyan-400"
                        breakdown={[
                            { label: t('totalMainBalances'), value: formatCurrency(kpis.totalMainBalances, locale) },
                            { label: t('totalInvestedBalances'), value: formatCurrency(kpis.totalInvestedBalances, locale) },
                            { label: t('totalOnHoldBalances'), value: formatCurrency(kpis.totalOnHoldBalances, locale) },
                        ]}
                    />
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('pendingActions')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard 
                        icon={<ShieldCheckIcon />}
                        title={t('kycPending')} 
                        value={kpis.kycPending.toString()}
                        gradient="bg-gradient-to-br from-yellow-500 to-orange-400"
                    />
                    <KPICard 
                        icon={<DocumentArrowUpIcon />}
                        title={t('pendingDeposits')} 
                        value={kpis.pendingDeposits.toString()}
                        gradient="bg-gradient-to-br from-amber-500 to-yellow-500"
                    />
                    <KPICard 
                        icon={<ClockIcon />}
                        title={t('pendingWithdrawals')} 
                        value={kpis.pendingWithdrawals.toString()}
                        gradient="bg-gradient-to-br from-teal-500 to-cyan-500"
                    />
                     <KPICard 
                        icon={<ExclamationTriangleIcon />}
                        title={t('openDisputes')} 
                        value={kpis.openDisputes.toString()}
                        gradient="bg-gradient-to-br from-orange-500 to-red-500"
                    />
                </div>
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#062E1F]/80 backdrop-blur-sm border border-gray-200 dark:border-green-400/20 rounded-2xl p-5 shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('recentSignups', { defaultValue: 'Recent Signups (Last 7 Days)' })}</h3>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={signupData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                                <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                                <Tooltip cursor={{fill: 'rgba(16, 185, 129, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid #E5E7EB', borderRadius: '0.75rem' }} />
                                <Bar dataKey="signups" fill="#10B981" barSize={30} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="bg-white dark:bg-[#062E1F]/80 backdrop-blur-sm border border-gray-200 dark:border-green-400/20 rounded-2xl p-5 shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('recentActivity')}</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {auditLogs.length > 0 ? auditLogs.slice(0, 50).map(log => (
                            <div key={log.id} className="text-sm border-b border-gray-200 dark:border-gray-700/50 pb-2 last:border-b-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200">{log.action.replace(/_/g, ' ')}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{log.details}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-end">{formatDateTime(log.timestamp, locale)}</p>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noAdminActivity', { defaultValue: 'No admin activity recorded yet.' })}</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};