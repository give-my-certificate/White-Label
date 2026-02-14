import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationConfig } from '../types/OrganizationConfig';
import supabase from '../configs/Supabase';

interface OrgConfigContextType {
  config: OrganizationConfig | null;
  loading: boolean;
  error: Error | null;
  getVerificationUrl: (certificateId: string) => string;
  updateCertificateId: (newCertificateId: string | undefined) => void;
}

// Default config for loading state
const defaultConfig: OrganizationConfig = {
  pageTitle: 'Certificate',
  metaDescription: 'Digital Certificate',
  verificationDomain: 'default.verification.com',
  verificationPath: '/v/',
  verificationProtocol: 'https',
  socialLinks: {},
  organizationId: '',
};

const OrganizationConfigContext = createContext<OrgConfigContextType | undefined>(undefined);

// Utility function to extract subdomain
const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Handle localhost for development (includes subdomain.localhost patterns)
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost') || hostname.startsWith('localhost')) {
    // For localhost, check if there's a subdomain pattern
    // Note: window.location.hostname doesn't include port, so we check the full host
    const fullHost = window.location.host; // Includes port if present
    const parts = fullHost.split('.');
    
    // If we have something like "org1.localhost" or "org1.localhost:3000"
    if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      // Remove port if present (e.g., "org1.localhost:3000" -> "org1")
      const subdomain = parts[0].split(':')[0];
      return subdomain;
    }
    return null; // Default org for localhost
  }
  
  // Extract subdomain from hostname
  // e.g., "org1.certificates.com" -> "org1"
  // e.g., "www.certificates.com" -> null (default)
  const parts = hostname.split('.');
  
  // If hostname has 3+ parts, first part is subdomain
  // e.g., org1.certificates.com = [org1, certificates, com]
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }
  
  // If hostname has 2 parts, it's likely a main domain (no subdomain)
  // e.g., certificates.com = [certificates, com] (no subdomain)
  
  return null; // No subdomain, use default org
};

export const OrganizationConfigProvider: React.FC<{ 
  certificateId?: string;  // Optional, for fallback
  children: React.ReactNode;
}> = ({ certificateId: initialCertificateId, children }) => {
  const [config, setConfig] = useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [certificateId, setCertificateId] = useState<string | undefined>(initialCertificateId);

  const updateCertificateId = (newCertificateId: string | undefined) => {
    setCertificateId(newCertificateId);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // ⭐ PRIMARY: Try to fetch by subdomain first
        const subdomain = getSubdomain();
        let data = null;
        let rpcError = null;

        if (subdomain) {
          const result = await supabase.rpc(
            'get_organization_config_by_subdomain',
            { subdomain_param: subdomain }
          );
          data = result.data;
          rpcError = result.error;
        }

        // ⭐ FALLBACK 1: If subdomain lookup fails and no subdomain, try default org
        if ((!data || data.length === 0) && !subdomain) {
          const result = await supabase.rpc('get_default_organization_config');
          data = result.data;
          rpcError = result.error;
        }
        
        // ⭐ FALLBACK 2: If still no config, try certificate ID
        if ((!data || data.length === 0) && certificateId) {
          const result = await supabase.rpc(
            'get_organization_config_by_certificate',
            { cert_id: certificateId }
          );
          data = result.data;
          rpcError = result.error;
        }

        if (rpcError) throw rpcError;

        if (data && data.length > 0) {
          const configData = data[0];
          setConfig({
            logoUrl: configData.logo_url,
            headerLogoUrl: configData.header_logo_url,
            faviconUrl: configData.favicon_url,
            qrLogoUrl: configData.qr_logo_url,
            pageTitle: configData.page_title || 'Certificate',
            metaDescription: configData.meta_description || 'Digital Certificate',
            verificationDomain: configData.verification_domain,
            verificationPath: configData.verification_path || '/v/',
            verificationProtocol: configData.verification_protocol || 'https',
            headerLinkUrl: configData.website,
            socialLinks: {
              facebook: configData.facebook || undefined,
              linkedin: configData.linkedin || undefined,
              twitter: configData.twitter || undefined,
              instagram: configData.instagram || undefined,
            },
            organizationId: configData.organization_id,
          });
        } else {
          // No config found, use defaults
          console.warn('No organization config found, using defaults');
          setConfig({
            pageTitle: 'Certificate',
            metaDescription: 'Digital Certificate',
            verificationDomain: 'default.verification.com',
            verificationPath: '/v/',
            verificationProtocol: 'https',
            socialLinks: {},
            organizationId: '',
          });
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching org config:', err);
        // Set defaults on error
        setConfig({
          pageTitle: 'Certificate',
          metaDescription: 'Digital Certificate',
          verificationDomain: 'default.verification.com',
          verificationPath: '/v/',
          verificationProtocol: 'https',
          socialLinks: {},
          organizationId: '',
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch config immediately on mount (don't wait for certificate)
    fetchConfig();
  }, [certificateId]); // Re-fetch if certificateId changes (fallback scenario)

  const getVerificationUrl = (certId: string): string => {
    if (!config) return '';
    const { verificationProtocol, verificationDomain, verificationPath } = config;
    return `${verificationProtocol}://${verificationDomain}${verificationPath}${certId}`;
  };

  return (
    <OrganizationConfigContext.Provider
      value={{ 
        config: loading ? defaultConfig : config || defaultConfig, 
        loading, 
        error, 
        getVerificationUrl, 
        updateCertificateId 
      }}
    >
      {children}
    </OrganizationConfigContext.Provider>
  );
};

export const useOrganizationConfig = () => {
  const context = useContext(OrganizationConfigContext);
  if (!context) {
    throw new Error('useOrganizationConfig must be used within OrganizationConfigProvider');
  }
  return context;
};

