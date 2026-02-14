import { useEffect } from 'react';
import { useOrganizationConfig } from '../context/OrganizationConfigContext';

export const DynamicHead: React.FC = () => {
  const { config, loading } = useOrganizationConfig();

  useEffect(() => {
    if (loading || !config) return;

    // Update page title
    document.title = config.pageTitle;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.metaDescription);

    // Update favicon
    if (config.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }
      favicon.href = config.faviconUrl;
    }
  }, [config, loading]);

  return null;
};

