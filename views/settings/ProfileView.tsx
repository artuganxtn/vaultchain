import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { AppContext } from '../../App';
import { User } from '../../types';
import { countries } from '../../data/countries';
import Card from '../../components/ui/Card';

const ProfileView: React.FC = () => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (context?.user) {
            const { user } = context;
            setName(user.name || '');
            setUsername(user.username || '');
            setPhone(user.phone || '');
            setCountry(user.country || '');
            setAddress(user.address || '');
        }
    }, [context?.user]);

    if (!context || !context.user) return null;
    const { user, updateUser, data } = context;

    const handleSave = async () => {
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (!name.trim()) {
            setError(t('fullNameRequired') || "Full name cannot be empty.");
            setIsLoading(false);
            return;
        }
        if (!username.trim()) {
            setError(t('usernameRequired') || "Username cannot be empty.");
            setIsLoading(false);
            return;
        }
        
        if (username !== user.username && data?.users.some(u => u.username === username)) {
             setError(t('usernameExistsError'));
             setIsLoading(false);
             return;
        }

        const updatedUser: User = {
            ...user,
            name,
            username,
            phone,
            country,
            address,
        };

        try {
            await updateUser(updatedUser);
            setSuccessMessage(t('profileUpdatedSuccess') || "Profile updated successfully!");
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            setError(t('profileUpdateFailed') || "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500";
    const readOnlyClasses = "w-full px-4 py-2 bg-gray-200 dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400";
    
    return (
        <Card>
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('profileInfo')}</h3>
                
                {/* Editable Fields */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fullName')}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('username')}</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailAddress')}</label>
                    <input type="email" value={user.email} disabled className={readOnlyClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('country')}</label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClasses}>
                        <option value="">{t('selectCountry')}</option>
                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
                </div>
                 {/* Read-only Fields */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('accountNumber')}</label>
                    <input type="text" value={user.accountNumber} disabled className={readOnlyClasses} />
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
                
                <div className="pt-2">
                    <button onClick={handleSave} disabled={isLoading} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                        {isLoading ? t('updating') : t('saveChanges')}
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ProfileView;