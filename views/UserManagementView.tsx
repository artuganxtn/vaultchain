
import React, { useState, useMemo, useContext } from 'react';
import { User, UserStatus } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import UserDetailDrawer from '../components/admin/UserDetailDrawer';
import { AppContext } from '../App';
import { getLocaleFromLanguage, formatCurrency, formatDate } from '../utils/locale';

const statusColorMap: { [key in UserStatus]: string } = {
    [UserStatus.VERIFIED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [UserStatus.UNVERIFIED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [UserStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [UserStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const UserRow: React.FC<{ user: User; onSelectUser: (user: User) => void; locale: string }> = ({ user, onSelectUser, locale }) => {
    const { t } = useTranslation();
    const userStatus = user.isBanned ? "Banned" : user.isFrozen ? "Frozen" : user.status;
    const customStatusColor = user.isBanned ? statusColorMap[UserStatus.REJECTED] : user.isFrozen ? statusColorMap[UserStatus.PENDING] : statusColorMap[user.status];

    return (
        <tr className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 cursor-pointer" onClick={() => onSelectUser(user)}>
            <td className="p-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{user.name}</td>
            <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{user.email}</td>
            <td className="p-4 text-sm text-gray-900 dark:text-white font-mono whitespace-nowrap">{formatCurrency(user.balance, locale)}</td>
            <td className="p-4 text-sm">
                <span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${customStatusColor}`}>
                    {t(userStatus)}
                </span>
            </td>
            <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(user.createdAt, locale)}</td>
            <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{user.country}</td>
        </tr>
    );
};


interface UserManagementViewProps {
    searchTerm: string;
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ searchTerm, statusFilter, setStatusFilter }) => {
    const { t, language } = useTranslation();
    const context = useContext(AppContext);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const locale = getLocaleFromLanguage(language);

    const users = context?.data?.users || [];

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            if (user.role === 'OWNER') return false; // Exclude owner
            const matchesSearch = searchTerm === '' || user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, statusFilter]);
    
    const handleUpdateUser = async (updatedUser: User) => {
        if (context) {
            await context.updateUser(updatedUser);
        }
        if (selectedUser && selectedUser.id === updatedUser.id) {
            setSelectedUser(updatedUser);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('userManagement')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('manageAllUsers')}</p>
                </div>
                <div className="bg-white dark:bg-[#062E1F]/80 backdrop-blur-sm border border-gray-200 dark:border-green-400/20 rounded-2xl p-4 shadow-md">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* The search input is now in the header, this filter remains here */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">{t('allStatuses')}</option>
                            <option value={UserStatus.VERIFIED}>{t('Verified')}</option>
                            <option value={UserStatus.UNVERIFIED}>{t('Unverified')}</option>
                            <option value={UserStatus.PENDING}>{t('Pending')}</option>
                            <option value={UserStatus.REJECTED}>{t('Rejected')}</option>
                        </select>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white dark:bg-[#062E1F]/80 backdrop-blur-sm border border-gray-200 dark:border-green-400/20 rounded-2xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-semibold">{t('user')}</th>
                                    <th className="p-4 font-semibold">{t('email')}</th>
                                    <th className="p-4 font-semibold">{t('balance')}</th>
                                    <th className="p-4 font-semibold">{t('status')}</th>
                                    <th className="p-4 font-semibold">{t('joinedDate')}</th>
                                    <th className="p-4 font-semibold">{t('country')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => <UserRow key={user.id} user={user} onSelectUser={setSelectedUser} locale={locale} />)
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            {t('noUsersYet')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => {
                            const userStatus = user.isBanned ? "Banned" : user.isFrozen ? "Frozen" : user.status;
                            const customStatusColor = user.isBanned ? statusColorMap[UserStatus.REJECTED] : user.isFrozen ? statusColorMap[UserStatus.PENDING] : statusColorMap[user.status];
                            return (
                                <div key={user.id} onClick={() => setSelectedUser(user)} className="bg-white dark:bg-[#062E1F]/80 backdrop-blur-sm border border-gray-200 dark:border-green-400/20 rounded-2xl shadow-md p-4 space-y-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${customStatusColor}`}>{t(userStatus)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700/50 pt-3">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('balance')}</p>
                                            <p className="font-mono font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(user.balance, locale)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('joinedDate')}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(user.createdAt, locale)}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t('noUsersYet')}</div>
                    )}
                </div>
            </div>
            {selectedUser && (
                <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onUpdateUser={handleUpdateUser} />
            )}
        </>
    );
};

export default UserManagementView;
