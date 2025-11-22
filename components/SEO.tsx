import React, { useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}
export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image = '/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://vaultchaintr.store',
  type = 'website'
}) => {
  const { language } = useTranslation();
  
  const defaultTitle = 'VaultChain - Modern Investment & Trading Platform';
  const defaultDescription = 'VaultChain is a comprehensive FinTech platform for investment, trading, and financial management. Trade cryptocurrencies, forex, stocks, and commodities with advanced tools and expert copy trading.';
  const defaultKeywords = 'VaultChain, investment platform, trading, cryptocurrency, forex, stocks, commodities, copy trading, financial management, FinTech';

  const pageTitle = title ? `${title} | VaultChain` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageImage = image.startsWith('http') ? image : `https://vaultchaintr.store${image}`;
  const pageUrl = url;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', pageKeywords);
    updateMetaTag('author', 'VaultChain');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', language);
    updateMetaTag('revisit-after', '7 days');

    // Open Graph tags
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', pageDescription, 'property');
    updateMetaTag('og:image', pageImage, 'property');
    updateMetaTag('og:url', pageUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'VaultChain', 'property');
    updateMetaTag('og:locale', language === 'ar' ? 'ar_SA' : language === 'tr' ? 'tr_TR' : 'en_US', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);
    updateMetaTag('twitter:image', pageImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // Update HTML lang attribute
    document.documentElement.lang = language;
  }, [pageTitle, pageDescription, pageKeywords, pageImage, pageUrl, type, language]);

  return null;
};