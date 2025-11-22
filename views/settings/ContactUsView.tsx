import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import { ChatBubbleLeftRightIcon } from '../../components/ui/Icons';

const ContactUsView: React.FC = () => {
    const { t } = useTranslation();

    const supportEmail = "support@vaultchaintr.store";
    const supportWhatsapp = "+905378299444";
    const whatsappLink = `https://wa.me/905378299444`;
    const supportWhatsapp2 = "+905074302420";
    const whatsappLink2 = `https://wa.me/905074302420`;

    return (
        <Card>
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border-b border-gray-200 dark:border-green-400/20">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('contactUs')}</h3>
            </div>
            <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    For any inquiries or support requests, please reach out to us through the following channels.
                </p>
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Email</h4>
                    <a href={`mailto:${supportEmail}`} className="text-green-600 dark:text-green-400 hover:underline">{supportEmail}</a>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">WhatsApp</h4>
                    <div className="flex flex-col space-y-1">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">{supportWhatsapp}</a>
                        <a href={whatsappLink2} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">{supportWhatsapp2}</a>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Support Hours</h4>
                    <p className="text-gray-600 dark:text-gray-300">Monday to Friday — 09:00 AM to 06:00 PM (Turkey Time).</p>
                </div>
            </div>
        </Card>
    );
};

export default ContactUsView;