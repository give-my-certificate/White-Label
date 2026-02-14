export interface OrganizationConfig {
  logoUrl?: string;
  headerLogoUrl?: string;
  faviconUrl?: string;
  qrLogoUrl?: string;
  pageTitle: string;
  metaDescription: string;
  verificationDomain: string;
  verificationPath: string;
  verificationProtocol: 'http' | 'https';
  headerLinkUrl?: string;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  organizationId: string;
}

export interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

