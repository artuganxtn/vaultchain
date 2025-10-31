

import React, { useContext } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AppContext } from '../App';
import Card from '../components/ui/Card';
import { ProfitIcon } from '../components/ui/Icons';

// Re-using the Toggle component from SettingsPage
const Toggle: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6 rtl:-translate-x-1' : 'translate-x-1'}`}
      />
    </button>
);

const ProfitControlView: React.FC = () => {
    const { t } = useTranslation();
    const context = useContext(AppContext);

    if (!context) return null;

    const { areProfitsWithdrawable, toggleProfitWithdrawal } = context;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('profitControl', { defaultValue: 'Profit Control' })}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('profitControlDesc', { defaultValue: 'Enable or disable profit withdrawal for all users.' })}</p>
            </div>
            <Card>
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <ProfitIcon className="w-6 h-6 text-green-500" />
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-md">{t('enableProfitWithdrawal', { defaultValue: 'Enable Profit Withdrawal' })}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('enableProfitWithdrawalDesc', { defaultValue: 'Allows users to withdraw their accumulated profits.' })}</p>
                        </div>
                    </div>
                    <Toggle enabled={areProfitsWithdrawable} onChange={toggleProfitWithdrawal} />
                </div>
            </Card>
        </div>
    );
};

export default ProfitControlView;