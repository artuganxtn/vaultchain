import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import { CopyIcon, GiftIcon, UsersIcon } from '../components/ui/Icons';

const ReferralStat: React.FC<{ label: string; value: string | number; icon: React.ReactElement<any>; }> = ({ label, value, icon }) => (
    <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl flex items-center space-x-4 rtl:space-x-reverse">
        <div className="bg-green-500/20 p-3 rounded-full">
            {React.cloneElement(icon, { className: "w-6 h-6 text-green-500" })}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export const ReferralView: React.FC<{ user: User, allUsers: User[] }> = ({ user, allUsers }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('referrals');

    const referralLink = `${window.location.origin}?ref=${user.referralCode}`;
    
    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fundedReferralsCount = useMemo(() => user.referrals.filter(r => r.status === 'funded').length, [user.referrals]);
    const agentProgress = Math.min((fundedReferralsCount / 5) * 100, 100);

    const referredUsersDetails = useMemo(() => {
        return user.referrals.map(ref => {
            const referredUser = allUsers.find(u => u.id === ref.userId);
            return {
                ...ref,
                name: referredUser?.name || 'Unknown User',
                joinDate: referredUser ? new Date(referredUser.createdAt).toLocaleDateString() : '-',
                totalDeposits: referredUser?.totalDeposits || 0
            };
        });
    }, [user.referrals, allUsers]);

    const totalTeamDeposits = useMemo(() => {
        return referredUsersDetails.reduce((sum, ref) => sum + ref.totalDeposits, 0);
    }, [referredUsersDetails]);

    return (
        <div className="space-y-6">
            <Card>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('Referral Program')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('referralRuleDetails')}</p>
                </div>
            </Card>

            {user.isAgent && (
                 <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 gap-1">
                    <button onClick={() => setActiveTab('referrals')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'referrals' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t('referrals')}</button>
                    <button onClick={() => setActiveTab('team')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'team' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t('myTeam')}</button>
                </div>
            )}

            {((user.isAgent && activeTab === 'referrals') || !user.isAgent) && (
                <div className="space-y-6">
                    <Card>
                        <h4 className="font-semibold mb-2">{t('referralLink')}</h4>
                        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-2">
                            <p className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1 text-start px-2 font-mono">{referralLink}</p>
                            <button onClick={() => handleCopy(referralLink)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold flex items-center space-x-1 rtl:space-x-reverse">
                                <CopyIcon /><span>{copied ? t('copied') : t('copyLink')}</span>
                            </button>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">{t('yourReferralCode', { defaultValue: "Your Referral Code" })}</h4>
                            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-2">
                                <p className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1 text-start px-2 font-mono">{user.referralCode}</p>
                                <button onClick={() => handleCopy(user.referralCode)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold flex items-center space-x-1 rtl:space-x-reverse">
                                    <CopyIcon /><span>{copied ? t('copied') : t('copy')}</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('shareCodeManually', { defaultValue: "Share this code with your friends to enter during sign-up." })}</p>
                        </div>
                    </Card>

                    <Card>
                        <h4 className="font-semibold mb-3">{user.isAgent ? t('agentGreeting') : t('becomeAnAgent')}</h4>
                        {user.isAgent ? (
                             <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                                 <p>{t('agentStaking')}</p>
                                 <p>{t('agentDepositBonus')}</p>
                             </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">{t('progress')}</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{fundedReferralsCount} / 5</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${agentProgress}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('agentRequirement', { count: 5 - fundedReferralsCount })}</p>
                            </>
                        )}
                    </Card>
                </div>
            )}
            
            {user.isAgent && activeTab === 'team' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <ReferralStat label={t('teamMembers')} value={referredUsersDetails.length} icon={<UsersIcon />} />
                        <ReferralStat label={t('totalTeamDeposits')} value={totalTeamDeposits.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<GiftIcon />} />
                    </div>
                    <Card>
                        <h4 className="font-semibold mb-3">{t('teamDetails')}</h4>
                        <div className="max-h-80 overflow-y-auto">
                            {referredUsersDetails.map(ref => (
                                <div key={ref.userId} className="py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{ref.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('joined')}: {ref.joinDate}</p>
                                    </div>
                                    <div className="text-end">
                                        <p className={`text-sm font-semibold ${ref.status === 'funded' ? 'text-green-500' : 'text-yellow-500'}`}>{t(ref.status)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('deposits')}: {ref.totalDeposits.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
