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
  socialLinks: SocialLinks;
  organizationId: string;
}

export interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

export interface OrganizationConfigContextType {
  config: OrganizationConfig | null;
  loading: boolean;
  error: Error | null;
  getVerificationUrl: (certificateId: string) => string;
}

export interface OrganizationConfigResponse {
  logo_url?: string;
  header_logo_url?: string;
  favicon_url?: string;
  qr_logo_url?: string;
  page_title: string;
  meta_description: string;
  verification_domain: string;
  verification_path: string;
  verification_protocol: string;
  header_link_url?: string;
  social_links: SocialLinks;
  organization_id: string;
}