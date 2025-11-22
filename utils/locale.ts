/**
 * Utility functions for locale and formatting
 */

export const getLocaleFromLanguage = (language: string): string => {
    const localeMap: { [key: string]: string } = {
        'en': 'en-US',
        'ar': 'ar-SA',
        'tr': 'tr-TR'
    };
    return localeMap[language] || 'en-US';
};

export const formatCurrency = (amount: number, locale: string): string => {
    return amount.toLocaleString(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
};

export const formatDate = (date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, options);
};

export const formatDateTime = (date: Date | string, locale: string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
};
