
import React, { useState, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { CryptoAsset } from '../types';
import Marquee from '../components/ui/Marquee';
import { ShieldCheckIcon, InvestmentIcon, TradingIcon, SparklesIcon, UsersIcon, PositionsIcon, GlobeAltIcon, ChevronDownIcon, UserPlusIcon, CreditCardIcon, MenuIcon, CloseIcon } from '../components/ui/Icons';
import { useClickOutside } from '../hooks/useClickOutside';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
  assets: CryptoAsset[];
}

const LanguageSwitcher = () => {
    const { language, setLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    useClickOutside(menuRef, () => setIsOpen(false));

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
        { code: 'tr', name: 'Türkçe' },
    ];
    
    const currentLangName = languages.find(l => l.code === language)?.name || 'Language';

    return (
        <div ref={menuRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors">
                <GlobeAltIcon className="w-5 h-5"/>
                <span>{currentLangName}</span>
                <ChevronDownIcon className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-20">
                    {languages.map(lang => (
                        <button key={lang.code} onClick={() => { setLanguage(lang.code as 'en'|'ar'|'tr'); setIsOpen(false); }} className={`w-full text-start px-4 py-2 text-sm ${language === lang.code ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>{lang.name}</button>
                    ))}
                </div>
            )}
        </div>
    )
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/80 dark:border-green-400/20 p-6 rounded-2xl shadow-md dark:shadow-lg dark:shadow-black/20 text-start transform hover:-translate-y-2 transition-transform duration-300">
        <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
);

const Step: React.FC<{ icon: React.ReactElement<any>; title: string; description: string; stepNumber: number; }> = ({ icon, title, description, stepNumber }) => (
    <div className="flex flex-col items-center text-center max-w-xs relative z-10 group">
        <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white ring-8 ring-gray-50 dark:ring-slate-900">
                {React.cloneElement(icon, { className: 'w-10 h-10' })}
            </div>
             <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-sm border-4 border-gray-50 dark:border-slate-900">{stepNumber}</div>
        </div>
        <h3 className="text-xl font-bold mt-6 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{description}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp, assets }) => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const navLinks = [
        { href: "#features", label: t('landing_nav_features') },
        { href: "#how-it-works", label: t('landing_nav_how_it_works') },
        { href: "#markets", label: t('landing_nav_markets') },
        { href: "#contact", label: t('landing_nav_contact') },
    ];

    const features = [
        { icon: <InvestmentIcon className="w-8 h-8 text-white" />, title: t('features_automated_investing_title'), description: t('features_automated_investing_desc') },
        { icon: <PositionsIcon className="w-8 h-8 text-white" />, title: t('features_copy_trading_title'), description: t('features_copy_trading_desc') },
        { icon: <TradingIcon className="w-8 h-8 text-white" />, title: t('features_multi_asset_trading_title'), description: t('features_multi_asset_trading_desc') },
        { icon: <ShieldCheckIcon className="w-8 h-8 text-white" />, title: t('features_high_security_title'), description: t('features_high_security_desc') },
        { icon: <SparklesIcon className="w-8 h-8 text-white" />, title: t('features_ai_assistant_title'), description: t('features_ai_assistant_desc') },
        { icon: <UsersIcon className="w-8 h-8 text-white" />, title: t('features_referral_program_title'), description: t('features_referral_program_desc') },
    ];
    
    return (
        <div className="bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-100">
            <header className="absolute top-0 left-0 right-0 z-30 p-4">
                <div className="container mx-auto flex justify-between items-center bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-xl p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white notranslate">
                        <span className="text-green-500">Vault</span>Chain
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                         {navLinks.map(link => (
                            <a key={link.href} href={link.href} className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green-500 transition-colors">{link.label}</a>
                        ))}
                        <LanguageSwitcher />
                    </nav>

                    <div className="hidden md:flex items-center space-x-2">
                        <button onClick={onLogin} className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">{t('signIn')}</button>
                        <button onClick={onSignUp} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:opacity-90 rounded-lg transition-opacity">{t('signUp')}</button>
                    </div>

                     <div className="md:hidden flex items-center">
                         <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700 dark:text-gray-200">
                            <MenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-gray-100 dark:bg-slate-900 z-50 p-4 flex flex-col md:hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white notranslate"><span className="text-green-500">Vault</span>Chain</div>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-700 dark:text-gray-200">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col items-center space-y-6 text-center">
                         {navLinks.map(link => (
                            <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-gray-800 dark:text-gray-100">{link.label}</a>
                        ))}
                    </nav>
                    <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
                         <div className="flex justify-center"><LanguageSwitcher /></div>
                         <button onClick={() => { onLogin(); setIsMenuOpen(false); }} className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-lg">{t('signIn')}</button>
                         <button onClick={() => { onSignUp(); setIsMenuOpen(false); }} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg">{t('signUp')}</button>
                    </div>
                </div>
            )}


            <main>
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center text-center overflow-hidden animated-gradient">
                    <div className="z-10 p-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                            {t('landing_hero_title')}
                        </h1>
                        <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto mb-8">
                           {t('landing_hero_subtitle')}
                        </p>
                        <button onClick={onSignUp} className="px-8 py-4 bg-white text-green-600 font-bold rounded-lg shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-105 duration-300">
                            {t('landing_hero_cta')}
                        </button>
                    </div>
                </section>

                <Marquee assets={assets} />

                {/* Why Choose Us Section */}
                <section id="features" className="py-20 bg-gray-100 dark:bg-slate-900 text-center">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('landing_why_title')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">{t('landing_why_subtitle')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <FeatureCard key={index} {...feature} />
                            ))}
                        </div>
                    </div>
                </section>
                
                 {/* How It Works Section */}
                <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-slate-800/50">
                     <div className="container mx-auto px-4 text-center">
                         <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 dark:text-white">{t('landing_how_it_works_title')}</h2>
                         <div className="relative flex flex-col md:flex-row justify-center items-center gap-16 md:gap-8">
                            <div className="absolute top-10 h-1 w-full max-w-2xl bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                            <Step icon={<UserPlusIcon />} title={t('landing_how_step1_title')} description={t('landing_how_step1_desc')} stepNumber={1} />
                            <Step icon={<CreditCardIcon />} title={t('landing_how_step2_title')} description={t('landing_how_step2_desc')} stepNumber={2} />
                            <Step icon={<InvestmentIcon />} title={t('landing_how_step3_title')} description={t('landing_how_step3_desc')} stepNumber={3} />
                        </div>
                     </div>
                </section>
                
                 {/* Placeholder for Markets */}
                <section id="markets" className="py-12 bg-gray-100 dark:bg-slate-900"></section>
                
                 {/* Placeholder for Contact */}
                <section id="contact" className="py-12 bg-gray-50 dark:bg-slate-800/50"></section>

            </main>
        </div>
    );
};

export default LandingPage;
