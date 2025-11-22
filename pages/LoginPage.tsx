

import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { useTranslation } from '../contexts/LanguageContext';
import { EyeIcon, EyeSlashIcon } from '../components/ui/Icons';


interface LoginPageProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignUp, onForgotPassword }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AppContext);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (auth) {
        const success = await auth.login(identifier, password);
        if (!success) {
            setError(t('invalidCredentials'));
        }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full">
        <div className="text-start mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('welcomeBack')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('signInToContinue')}</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
               <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('emailOrUsername')}</label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white text-sm"
                  disabled={isLoading}
                />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pe-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 px-4 flex items-center text-gray-500 dark:text-gray-400"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>
          
           <div className="flex items-center justify-end">
            <div className="text-sm">
                <button type="button" onClick={onForgotPassword} className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
                    {t('forgotPassword')}
                </button>
            </div>
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('signingIn')}
                </>
              ) : (
                 t('signIn')
              )}
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('dontHaveAccount')}{' '}
            <button onClick={onSwitchToSignUp} className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 focus:outline-none disabled:opacity-75" disabled={isLoading}>
              {t('signUp')}
            </button>
          </p>
        </form>
    </div>
  );
};

export default LoginPage;