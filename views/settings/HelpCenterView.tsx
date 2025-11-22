import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import { QuestionMarkCircleIcon } from '../../components/ui/Icons';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{question}</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{answer}</p>
    </div>
);

const HelpCenterView: React.FC = () => {
    const { t } = useTranslation();

    const faqs = [
        { q: "Q1: How do I start investing?", a: "Create a new account, verify your identity, then you can deposit and start investing directly." },
        { q: "Q2: How can I withdraw my profits?", a: "You can withdraw your profits at any time from the 'Wallet' section in your dashboard after identity verification." },
        { q: "Q3: What is the daily cumulative profit?", a: "The VaultChain system offers daily cumulative profits ranging from 3.5% to 5% based on market activity." },
        { q: "Q4: Is my money safe?", a: "Yes, we use advanced protection systems and encryption technologies to ensure the highest level of security." },
        { q: "Q5: How do I contact technical support?", a: "Via the email or WhatsApp number provided below." }
    ];

    return (
        <Card>
             <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border-b border-gray-200 dark:border-green-400/20">
                <QuestionMarkCircleIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('faq')}</h3>
            </div>
             <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Welcome to the <span className="notranslate">VaultChain</span> Help Center. Here you will find answers to the most common questions and a complete guide to using the platform.
                </p>
                <div>
                    {faqs.map((faq, index) => <FAQItem key={index} question={faq.q} answer={faq.a} />)}
                </div>
                 <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Live Technical Support:</h4>
                    <div className="mt-1 text-sm flex flex-col space-y-1">
                        <a href="mailto:support@vaultchaintr.store" className="text-green-600 dark:text-green-400 hover:underline">support@vaultchaintr.store</a>
                        <a href="https://wa.me/905378299444" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">+90 537 829 9444</a>
                        <a href="https://wa.me/905074302420" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">+90 507 430 2420</a>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default HelpCenterView;