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
  url: 'https://vaultchaintr.com',
  logo: 'https://vaultchaintr.com/logo.png',
  sameAs: [
    // Add social media links here
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@vaultchaintr.com'
  }
});

export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VaultChain',
  url: 'https://vaultchaintr.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://vaultchaintr.com/search?q={search_term_string}',
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
