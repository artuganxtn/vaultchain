import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import { DocumentTextIcon } from '../../components/ui/Icons';

const PrivacyPolicyView: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Card>
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border-b border-gray-200 dark:border-green-400/20">
                <DocumentTextIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('privacyPolicy')}</h3>
            </div>
            <div className="p-4 space-y-4 text-sm text-gray-600 dark:text-gray-300 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-gray-500">Last updated: October 26, 2025</p>

                <p>Welcome to <span className="notranslate">VaultChain</span>. Our company is committed to protecting your privacy and ensuring the security of your personal data when you use our application or website. This policy explains how we collect your information, how we use it, and how we maintain its confidentiality in accordance with the best international data protection standards.</p>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">1. Information We Collect</h4>
                <p>We collect the following information when you register or use our services:</p>
                <ul className="list-disc list-inside space-y-1 ps-4">
                    <li><strong>Personal Information:</strong> Full name, residential address, phone number, email address, official documents for identity verification (ID card, passport, driver's license).</li>
                    <li><strong>Financial Information:</strong> E-wallet details, balances, transfers, financial transactions, bank account data for withdrawals or deposits.</li>
                    <li><strong>Technical Information:</strong> IP address, device type, operating system, application version, geographic location data (when enabled), login and activity logs within the application.</li>
                </ul>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">2. How We Use Information</h4>
                <p>We use the information we collect for the following purposes:</p>
                 <ul className="list-disc list-inside space-y-1 ps-4">
                    <li>Creating and verifying your account.</li>
                    <li>Enabling deposit, withdrawal, and investment operations.</li>
                    <li>Improving user experience and service quality.</li>
                    <li>Communicating with you about notifications, security alerts, or offers.</li>
                    <li>Complying with local and international laws and regulations to combat fraud and money laundering.</li>
                    <li>Analyzing statistical performance of our services in a way that does not compromise your privacy.</li>
                </ul>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">3. Identity Verification (KYC)</h4>
                <p>The user is required to provide original and up-to-date documents including: National ID card (both sides), Passport, Driver's license, Proof of residential address (utility bill, lease agreement, or bank document). All features (withdrawal, deposit, trading, bonus, investment) will not be activated until identity is fully verified. Upon approval, the user is granted a welcome bonus of $10.</p>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">4. Information Sharing</h4>
                 <p>We may share your data only in the following cases:</p>
                <ul className="list-disc list-inside space-y-1 ps-4">
                    <li>With regulatory or governmental authorities upon legal request.</li>
                    <li>With approved partners to provide payment or identity verification services.</li>
                    <li>With technical support and maintenance teams to improve the service.</li>
                </ul>
                <p className="font-semibold">We do not sell, rent, or share your data with any third party for commercial or marketing purposes.</p>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">5. Data Protection</h4>
                <p>We use advanced security systems including: SSL encryption for all communications, secure servers under constant monitoring, specific access policies for employees within strict authorization levels, and automatic backups to ensure data is not lost.</p>
                
                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">6. Financial Transactions</h4>
                <p>All financial transactions are conducted through secure and encrypted interfaces. The adopted prices are fetched in real-time from TradingView (USD/TRY). A precise record of each transaction is saved, including the price, time, and currency used. Any unauthorized transaction will be immediately investigated, and necessary actions will be taken.</p>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">7. User Rights</h4>
                <p>The user has the right to: Access their personal data and request a copy, correct or update any inaccurate information, delete their account from the system after settling any pending financial transactions, and object to the processing of their data at any time within legal limits.</p>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">8. Legal Obligations</h4>
                <p>The user agrees not to: Create more than one account, enter fraudulent data or documents, or use the application for illegal or fraudulent purposes. In case of a proven violation, the application management has the right to freeze the account immediately and report it to the competent authorities.</p>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">9. Contact Us</h4>
                <p>If you have any questions or complaints, you can contact us via:</p>
                 <ul className="list-disc list-inside space-y-1 ps-4">
                    <li>Email: <a href="mailto:support@vaultchaintr.store" className="text-green-500">support@vaultchaintr.store</a></li>
                    <li>Phone (WhatsApp): <a href="https://wa.me/905378299444" className="text-green-500">+90 537 829 9444</a></li>
                </ul>
                <p>Our support team is available around the clock to assist you.</p>

                <h4 className="font-bold text-md text-gray-800 dark:text-gray-100 pt-2">10. Policy Updates</h4>
                <p>We reserve the right to modify this Privacy Policy from time to time. Users will be notified of any material changes via email or an in-app notification.</p>
                
                <p className="font-semibold pt-4">By continuing to use the <span className="notranslate">VaultChain</span> application, you agree to this policy and confirm that you have read and fully understood it.</p>
            </div>
        </Card>
    );
};

export default PrivacyPolicyView;