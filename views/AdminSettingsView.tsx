



import React, { useState, useContext } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { addAdminUser } from '../services/api';
import Modal from '../components/ui/Modal';
import { GlobeAltIcon, UserPlusIcon, ExclamationTriangleIcon } from '../components/ui/Icons';
import { AppContext } from '../App';
import { AddAdminParams } from '../types';

const SettingsCard: React.FC<{ title: string, icon: React.ReactElement<any>, children: React.ReactNode, className?: string }> = ({ title, icon, children, className }) => (
    <div className={`bg-white dark:bg-[#062E1F]/80 backdrop-blur-sm border border-gray-200 dark:border-green-400/20 rounded-2xl shadow-md ${className}`}>
        <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border-b border-gray-200 dark:border-gray-700/50">
            {React.cloneElement(icon, { className: "w-6 h-6 text-green-500" })}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

const AdminSettingsView: React.FC = () => {
    const { t, language, setLanguage } = useTranslation();
    const context = useContext(AppContext);

    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [newAdminPermissions, setNewAdminPermissions] = useState({
        canManageUsers: true,
        canAdjustBalance: false,
        canApproveKyc: false,
    });
    
    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const params: AddAdminParams = {
            fullName: newAdminName,
            email: newAdminEmail,
            password: newAdminPassword,
            permissions: newAdminPermissions,
        };
        await addAdminUser(params);
        if (context) {
            await context.refetchData();
        }
        setAddAdminModalOpen(false);
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminPermissions({ canManageUsers: true, canAdjustBalance: false, canApproveKyc: false });
    };

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setNewAdminPermissions(prev => ({...prev, [name]: checked }));
    }

    return (
        <div className="space-y-8">
             <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('systemSettings')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('managePlatformSettings')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                     <SettingsCard title={t('language')} icon={<GlobeAltIcon />}>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-800 dark:text-gray-200">{t('interfaceLanguage')}</span>
                             <div className="flex space-x-1 rtl:space-x-reverse bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                                <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm rounded ${language === 'en' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>EN</button>
                                <button onClick={() => setLanguage('ar')} className={`px-3 py-1 text-sm rounded ${language === 'ar' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>AR</button>
                                <button onClick={() => setLanguage('tr')} className={`px-3 py-1 text-sm rounded ${language === 'tr' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>TR</button>
                            </div>
                        </div>
                    </SettingsCard>
                </div>
                
                <SettingsCard title={t('assistants')} icon={<UserPlusIcon />}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('manageAssistantsDesc')}</p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {context?.data?.users?.filter(u => u.role === 'ADMIN' && u.id !== context?.user?.id).length > 0 ? (
                            context.data.users.filter(u => u.role === 'ADMIN' && u.id !== context?.user?.id).map(admin => (
                                <div key={admin.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{admin.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                                    </div>
                                    <button className="text-xs text-red-500 hover:underline">{t('remove', { defaultValue: 'Remove' })}</button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">{t('noAssistants', { defaultValue: 'No assistants added yet.' })}</p>
                        )}
                    </div>
                    <button onClick={() => setAddAdminModalOpen(true)} className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        {t('addAssistant')}
                    </button>
                </SettingsCard>
            </div>

             <Modal isOpen={isAddAdminModalOpen} onClose={() => setAddAdminModalOpen(false)} title={t('addAssistant')}>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fullName')}</label>
                        <input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('assistantEmail')}</label>
                        <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                        <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('permissions')}</label>
                        <div className="space-y-2">
                           <label className="flex items-center space-x-3 rtl:space-x-reverse">
                               <input type="checkbox" name="canManageUsers" checked={newAdminPermissions.canManageUsers} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                               <span className="text-gray-800 dark:text-gray-200">{t('canManageUsers')}</span>
                           </label>
                           <label className="flex items-center space-x-3 rtl:space-x-reverse">
                               <input type="checkbox" name="canAdjustBalance" checked={newAdminPermissions.canAdjustBalance} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                               <span className="text-gray-800 dark:text-gray-200">{t('canAdjustBalance')}</span>
                           </label>
                           <label className="flex items-center space-x-3 rtl:space-x-reverse">
                               <input type="checkbox" name="canApproveKyc" checked={newAdminPermissions.canApproveKyc} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                               <span className="text-gray-800 dark:text-gray-200">{t('canApproveKyc')}</span>
                           </label>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        {t('createAssistant')}
                    </button>
                </form>
             </Modal>
        </div>
    );
};
export default AdminSettingsView;