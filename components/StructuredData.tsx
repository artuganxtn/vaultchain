import { useEffect } from 'react';

interface StructuredDataProps {
  data: object;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = 'structured-data';
    
    // Remove existing structured data script if any
    const existing = document.getElementById('structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
};

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'VaultChain',
  description: 'Modern investment and trading platform for cryptocurrencies, forex, stocks, and commodities',
  url: 'https://vaultchaintr.store',
  logo: 'https://vaultchaintr.store/logo.png',
  sameAs: [
    // Add social media links here
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@vaultchaintr.store'
  }
});

export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VaultChain',
  url: 'https://vaultchaintr.store',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://vaultchaintr.store/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
});

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});
