
import React, { useState, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { CryptoAsset } from '../types';
import Marquee from '../components/ui/Marquee';
import { ShieldCheckIcon, InvestmentIcon, TradingIcon, SparklesIcon, UsersIcon, PositionsIcon, GlobeAltIcon, ChevronDownIcon, UserPlusIcon, CreditCardIcon, MenuIcon, CloseIcon, CheckDoubleIcon, ReceiveIcon } from '../components/ui/Icons';
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
    const APK_URL = '/downloads/vaultchain.apk';
    const APK_SIZE_LABEL = '≈16 MB';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const navLinks = [
        { href: "#features", label: t('landing_nav_features') },
        { href: "#how-it-works", label: t('landing_nav_how_it_works') },
        { href: "#markets", label: t('landing_nav_markets') },
        { href: "#contact", label: t('landing_nav_contact') },
        { href: "#download", label: t('landing_nav_download') },
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
            <header className="absolute top-0 left-0 right-0 z-30 p-2 sm:p-4">
                <div className="container mx-auto flex justify-between items-center bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-xl p-2 sm:p-3">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white notranslate">
                        <span className="text-green-500">Vault</span>Chain
                    </div>

                    <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                         {navLinks.map(link => (
                            <a key={link.href} href={link.href} className="text-xs xl:text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green-500 transition-colors whitespace-nowrap">{link.label}</a>
                        ))}
                        <a
                            href={APK_URL}
                            download
                            className="inline-flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-emerald-500 transition-colors"
                        >
                            <ReceiveIcon className="w-4 h-4 xl:w-5 xl:h-5" />
                            <span className="hidden xl:inline">{t('landing_download_button')}</span>
                            <span className="xl:hidden">APK</span>
                        </a>
                        <LanguageSwitcher />
                    </nav>

                    <div className="hidden md:flex lg:hidden items-center space-x-2">
                        <a
                            href={APK_URL}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-600 border border-green-500/60 rounded-lg hover:bg-green-50 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                            <ReceiveIcon className="w-4 h-4" />
                            APK
                        </a>
                        <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700 dark:text-gray-200">
                            <MenuIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center space-x-2">
                        <button onClick={onLogin} className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold text-gray-800 dark:text-gray-100 bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap">{t('signIn')}</button>
                        <button onClick={onSignUp} className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold text-white bg-gradient-to-tr from-green-500 to-emerald-700 hover:opacity-90 rounded-lg transition-opacity whitespace-nowrap">{t('signUp')}</button>
                    </div>

                     <div className="lg:hidden flex items-center">
                         <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700 dark:text-gray-200">
                            <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
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
                        <a
                            href={APK_URL}
                            download
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-semibold text-green-600"
                        >
                            {t('landing_download_button')}
                        </a>
                    </nav>
                    <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
                         <div className="flex justify-center"><LanguageSwitcher /></div>
                         <button onClick={() => { onLogin(); setIsMenuOpen(false); }} className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-lg">{t('signIn')}</button>
                         <button onClick={() => { onSignUp(); setIsMenuOpen(false); }} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg">{t('signUp')}</button>
                         <a
                            href={APK_URL}
                            download
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 border border-green-500/60 text-green-600 font-bold rounded-lg"
                        >
                            <ReceiveIcon className="w-5 h-5" />
                            {t('landing_download_button')}
                        </a>
                    </div>
                </div>
            )}


            <main>
                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden animated-gradient px-4">
                    <div className="z-10 p-4 w-full max-w-6xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 px-2">
                            {t('landing_hero_title')}
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-green-100 max-w-3xl mx-auto mb-8 px-4">
                           {t('landing_hero_subtitle')}
                        </p>
                        <button onClick={onSignUp} className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-green-600 font-bold rounded-lg shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-105 duration-300 text-sm sm:text-base">
                            {t('landing_hero_cta')}
                        </button>
                    </div>
                </section>

                <Marquee assets={assets} />

                {/* Why Choose Us Section */}
                <section id="features" className="py-12 sm:py-16 md:py-20 bg-gray-100 dark:bg-slate-900 text-center">
                    <div className="container mx-auto px-4 sm:px-6">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white px-2">{t('landing_why_title')}</h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 px-4">{t('landing_why_subtitle')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {features.map((feature, index) => (
                                <FeatureCard key={index} {...feature} />
                            ))}
                        </div>
                    </div>
                </section>
                
                 {/* How It Works Section */}
                <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-slate-800/50">
                     <div className="container mx-auto px-4 sm:px-6 text-center">
                         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-gray-900 dark:text-white px-2">{t('landing_how_it_works_title')}</h2>
                         <div className="relative flex flex-col md:flex-row justify-center items-center gap-12 sm:gap-16 md:gap-8">
                            <div className="absolute top-10 h-1 w-full max-w-2xl bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                            <Step icon={<UserPlusIcon />} title={t('landing_how_step1_title')} description={t('landing_how_step1_desc')} stepNumber={1} />
                            <Step icon={<CreditCardIcon />} title={t('landing_how_step2_title')} description={t('landing_how_step2_desc')} stepNumber={2} />
                            <Step icon={<InvestmentIcon />} title={t('landing_how_step3_title')} description={t('landing_how_step3_desc')} stepNumber={3} />
                        </div>
                     </div>
                </section>
                
                 {/* Placeholder for Markets */}
                <section id="markets" className="py-12 bg-gray-100 dark:bg-slate-900"></section>
                
                 {/* Mobile Download Section */}
                <section id="download" className="py-20 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 text-white">
                    <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="uppercase text-sm tracking-[0.3em] text-emerald-100 mb-4">{t('landing_download_button')}</p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 px-2">{t('landing_download_title')}</h2>
                            <p className="text-emerald-100 mb-8">{t('landing_download_subtitle')}</p>
                            <ul className="space-y-4 mb-8">
                                {[t('landing_download_feature1'), t('landing_download_feature2'), t('landing_download_feature3')].map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span className="mt-1 p-1 bg-white/20 rounded-full">
                                            <CheckDoubleIcon className="w-4 h-4" />
                                        </span>
                                        <span className="text-emerald-50 text-sm md:text-base">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <a
                                    href={APK_URL}
                                    download
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg shadow-emerald-900/30 hover:-translate-y-1 transition-transform"
                                >
                                    <ReceiveIcon className="w-5 h-5" />
                                    {t('landing_download_button')}
                                </a>
                                <span className="text-sm text-emerald-100">{t('landing_download_note', { size: APK_SIZE_LABEL })}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-white/20 blur-3xl"></div>
                            <div className="relative bg-gray-900 text-white rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
                                <p className="text-sm text-emerald-200 uppercase tracking-[0.3em] mb-4">{t('landing_download_card_caption')}</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">{t('landing_nav_features')}</span>
                                        <span className="text-xl font-bold text-emerald-400">24/7</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">{t('landing_nav_contact')}</span>
                                        <span className="text-xl font-bold text-emerald-400">5s</span>
                                    </div>
                                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-6">
                                        <p className="text-sm uppercase tracking-[0.2em] text-white/80 mb-2">{t('landing_download_button')}</p>
                                        <p className="text-2xl font-bold mb-1">VaultChain Mobile</p>
                                        <p className="text-sm text-emerald-50">{t('landing_download_subtitle')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Placeholder for Contact */}
                <section id="contact" className="py-12 bg-gray-50 dark:bg-slate-800/50"></section>

            </main>
        </div>
    );
};

export default LandingPage;
