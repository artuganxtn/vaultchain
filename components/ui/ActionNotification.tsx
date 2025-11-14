import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { ExclamationTriangleIcon, CloseIcon } from './Icons';

interface ActionNotificationProps {
  type: 'freeze' | 'ban';
  reason: string;
  onClose: () => void;
}

const ActionNotification: React.FC<ActionNotificationProps> = ({ type, reason, onClose }) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onClose();
    }
  }, [countdown, onClose]);

  const isBan = type === 'ban';
  const bgColor = isBan ? 'bg-red-500/90 border-red-700' : 'bg-yellow-400/90 border-yellow-600';
  const textColor = isBan ? 'text-white' : 'text-gray-900';
  const title = isBan ? t('accountBanned') : t('accountFrozen');

  return (
    <div className="fixed top-5 right-5 left-5 sm:left-auto z-[100] max-w-sm">
      <div className={`relative rounded-lg shadow-2xl p-4 border-l-4 ${bgColor} ${textColor}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className={`w-6 h-6 ${isBan ? 'text-white' : 'text-red-800'}`} />
          </div>
          <div className="ms-3 flex-1">
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm">{reason}</p>
          </div>
          <div className="ms-4 flex-shrink-0 flex">
            <button onClick={onClose} className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 ${isBan ? 'hover:bg-red-600 focus:ring-white' : 'hover:bg-yellow-500 focus:ring-gray-900'}`}>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-1 right-2 rtl:right-auto rtl:left-2 text-xs opacity-70">
          {t('closingIn', { countdown: countdown.toString(), defaultValue: `Closing in ${countdown} seconds...` })}
        </div>
      </div>
    </div>
  );
};

export default ActionNotification;