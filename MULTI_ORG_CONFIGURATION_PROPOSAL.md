# Multi-Organization Configuration Architecture Proposal

## Current Problems Identified

### Hardcoded Values Found:
1. **QR Code Verification URL** (`DisplayCertificate.tsx:128,131`)
   - `https://mindmerge.verification.givemycertificate.com/v/`

2. **Organization Logos** (Multiple locations)
   - Header logo: `src/components/logo/Logo.tsx` - `mindmergesq.png`
   - Certificate sidebar: `DisplayCertificate.tsx:232` - `MindMergeLogSq`
   - QR code logo: `QrElement.tsx:26` - Hardcoded GMC logo URL

3. **Page Title & Meta** (`public/index.html:34,10`)
   - Title: `"Certificate - Mindmerge"`
   - Description: `"Certificate by Mindmerge"`

4. **Favicon** (`public/index.html:5`)
   - `/favicon.ico` (static file)

5. **Header Links** (`Header.tsx:23`)
   - `https://gomindmerge.com/`

6. **Social Media Links** (`DisplayCertificate.tsx:324,340`)
   - Facebook, LinkedIn URLs

---

## Proposed Architecture Solutions

### **Option 1: Database-Driven Configuration (Recommended)**
**Best for:** Multi-tenant SaaS with centralized management

#### Architecture Overview
- Store organization configuration in Supabase database
- **Primary**: Fetch org config based on subdomain (immediate, on app load)
- **Fallback**: Fetch org config based on certificate's `organization_id` (if subdomain not available)
- Cache configuration for performance
- Support runtime updates without code deployment
- Support subdomain configuration per organization

#### Implementation Structure

```
┌─────────────────────────────────────────┐
│  Browser                                │
│  ┌───────────────────────────────────┐ │
│  │ Subdomain Detection                │ │
│  │ window.location.hostname           │ │
│  │ e.g., "org1.certificates.com"      │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Supabase Database                      │
│  ┌───────────────────────────────────┐ │
│  │ organizations_config table         │ │
│  │ - id (UUID)                        │ │
│  │ - organization_id (FK)             │ │
│  │ - subdomain (string) ⭐ NEW        │ │
│  │ - verification_domain (string)    │ │
│  │ - verification_path (string)      │ │
│  │ - logo_url (string)                │ │
│  │ - favicon_url (string)             │ │
│  │ - page_title (string)              │ │
│  │ - meta_description (string)        │ │
│  │ - header_logo_url (string)         │ │
│  │ - header_link_url (string)         │ │
│  │ - qr_logo_url (string)             │ │
│  │ - social_links (JSONB)             │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  React App (App Initialization)        │
│  ┌───────────────────────────────────┐ │
│  │ OrganizationConfigProvider         │ │
│  │ 1. Extract subdomain               │ │
│  │ 2. Fetch config by subdomain ⭐    │ │
│  │ 3. Fallback: Fetch by cert_id      │ │
│  │ 4. Cache in Context/State          │ │
│  │ 5. Update <head> immediately       │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ Components use config via hooks:   │ │
│  │ - useOrgConfig()                   │ │
│  │ - useVerificationUrl()             │ │
│  │ - useOrgBranding()                 │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Database Schema

```sql
CREATE TABLE organizations_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Subdomain Configuration ⭐ NEW
  subdomain TEXT,  -- e.g., 'org1', 'mindmerge', 'hero-vired'
  -- Note: NULL subdomain = default/main domain
  
  -- Branding
  logo_url TEXT,
  header_logo_url TEXT,
  favicon_url TEXT,
  qr_logo_url TEXT,
  
  -- Page Metadata
  page_title TEXT DEFAULT 'Certificate',
  meta_description TEXT,
  
  -- URLs
  verification_domain TEXT NOT NULL,  -- e.g., 'mindmerge.verification.givemycertificate.com'
  verification_path TEXT DEFAULT '/v/', -- e.g., '/v/' or '/verify/'
  verification_protocol TEXT DEFAULT 'https',  -- 'http' or 'https'
  header_link_url TEXT,
  
  -- Social Links (JSONB)
  social_links JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id),
  -- ⭐ Ensure subdomain uniqueness (NULL values allowed multiple times for default orgs)
  CONSTRAINT unique_subdomain UNIQUE NULLS NOT DISTINCT (subdomain)
);

-- Indexes for fast lookups
CREATE INDEX idx_org_config_org_id ON organizations_config(organization_id);
CREATE INDEX idx_org_config_subdomain ON organizations_config(subdomain);  -- ⭐ NEW

-- RPC Function 1: Get config by subdomain (PRIMARY METHOD) ⭐ NEW
CREATE OR REPLACE FUNCTION get_organization_config_by_subdomain(
  subdomain_param TEXT
)
RETURNS TABLE (
  logo_url TEXT,
  header_logo_url TEXT,
  favicon_url TEXT,
  qr_logo_url TEXT,
  page_title TEXT,
  meta_description TEXT,
  verification_domain TEXT,
  verification_path TEXT,
  verification_protocol TEXT,
  header_link_url TEXT,
  social_links JSONB,
  organization_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oc.logo_url,
    oc.header_logo_url,
    oc.favicon_url,
    oc.qr_logo_url,
    oc.page_title,
    oc.meta_description,
    oc.verification_domain,
    oc.verification_path,
    oc.verification_protocol,
    oc.header_link_url,
    oc.social_links,
    oc.organization_id
  FROM organizations_config oc
  WHERE oc.subdomain = subdomain_param
  LIMIT 1;
END;
$$;

-- RPC Function 2: Get config by certificate ID (FALLBACK METHOD)
CREATE OR REPLACE FUNCTION get_organization_config_by_certificate(
  cert_id UUID
)
RETURNS TABLE (
  logo_url TEXT,
  header_logo_url TEXT,
  favicon_url TEXT,
  qr_logo_url TEXT,
  page_title TEXT,
  meta_description TEXT,
  verification_domain TEXT,
  verification_path TEXT,
  verification_protocol TEXT,
  header_link_url TEXT,
  social_links JSONB,
  organization_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oc.logo_url,
    oc.header_logo_url,
    oc.favicon_url,
    oc.qr_logo_url,
    oc.page_title,
    oc.meta_description,
    oc.verification_domain,
    oc.verification_path,
    oc.verification_protocol,
    oc.header_link_url,
    oc.social_links,
    oc.organization_id
  FROM organizations_config oc
  INNER JOIN certificates c ON c.organization_id = oc.organization_id
  WHERE c.id = cert_id
  LIMIT 1;
END;
$$;
```

#### Code Structure

```
src/
├── configs/
│   └── OrganizationConfig.ts        # Config types & defaults
├── context/
│   └── OrganizationConfigContext.tsx # React Context for org config
├── hooks/
│   ├── useOrganizationConfig.ts     # Main hook to get config
│   ├── useVerificationUrl.ts        # Hook for QR URL generation
│   └── useOrgBranding.ts            # Hook for branding assets
└── components/
    ├── DynamicHead.tsx              # Component to update <head>
    └── ... (existing components updated)
```

#### Pros:
✅ No code changes needed for new orgs  
✅ Centralized management  
✅ Runtime updates possible  
✅ Scales to unlimited organizations  
✅ Can be managed via admin dashboard  

#### Cons:
❌ Requires database changes  
❌ Initial setup complexity  
❌ Need to handle loading states  

---

### **Option 2: Environment Variable + Subdomain Routing**
**Best for:** Separate deployments per organization

#### Architecture Overview
- Use subdomain to identify organization (e.g., `org1.certificates.com`, `org2.certificates.com`)
- Environment variables per deployment
- Configuration file per organization

#### Implementation Structure

```
┌─────────────────────────────────────────┐
│  Deployment per Organization            │
│  ┌───────────────────────────────────┐ │
│  │ .env.org1                          │ │
│  │ REACT_APP_ORG_ID=org1              │ │
│  │ REACT_APP_VERIFICATION_DOMAIN=...  │ │
│  │ REACT_APP_LOGO_URL=...              │ │
│  │ REACT_APP_FAVICON_URL=...          │ │
│  │ REACT_APP_PAGE_TITLE=...            │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ config/                            │ │
│  │   org1.json                        │ │
│  │   org2.json                        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Pros:
✅ Simple implementation  
✅ Complete isolation between orgs  
✅ No database dependency  

#### Cons:
❌ Separate deployment per org  
❌ More infrastructure overhead  
❌ Code changes needed for new orgs (env files)  

---

### **Option 3: Hybrid Approach (Database + Environment Fallback)**
**Best for:** Flexibility with fallback options

#### Architecture Overview
- Primary: Fetch from database (like Option 1)
- Fallback: Environment variables for default/fallback values
- Supports both multi-tenant and single-tenant deployments

#### Implementation Structure

```typescript
// Priority: Database Config > Environment Variables > Defaults

const getOrgConfig = async (certificateId: string) => {
  // Try database first
  const dbConfig = await fetchOrgConfigFromDB(certificateId);
  
  if (dbConfig) return dbConfig;
  
  // Fallback to environment
  return {
    verificationDomain: process.env.REACT_APP_VERIFICATION_DOMAIN || 'default.verification.com',
    logoUrl: process.env.REACT_APP_LOGO_URL || '/default-logo.png',
    // ... etc
  };
};
```

#### Pros:
✅ Best of both worlds  
✅ Flexible deployment options  
✅ Graceful degradation  

#### Cons:
❌ More complex implementation  
❌ Need to handle multiple config sources  

---

### **Option 4: Configuration File (JSON) + API Endpoint**
**Best for:** External configuration management

#### Architecture Overview
- Store config in external JSON files or API
- Fetch on app initialization
- Support CDN hosting for config files

#### Implementation Structure

```
┌─────────────────────────────────────────┐
│  CDN/API Server                         │
│  ┌───────────────────────────────────┐ │
│  │ /config/{orgId}.json              │ │
│  │ {                                  │ │
│  │   "verificationDomain": "...",     │ │
│  │   "logoUrl": "...",                │ │
│  │   ...                              │ │
│  │ }                                  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  React App                              │
│  - Fetches config on mount              │
│  - Caches in memory                     │
│  - Updates <head> dynamically           │
└─────────────────────────────────────────┘
```

#### Pros:
✅ No database dependency  
✅ Can be managed externally  
✅ Easy to update  

#### Cons:
❌ External dependency  
❌ Need to handle network failures  
❌ CORS considerations  

---

## **Recommended Solution: Option 1 Enhanced with Subdomain Support**

### Why This Approach?
1. **Subdomain-Based Identification**: Leverage existing subdomain infrastructure
2. **Early Config Loading**: Load org config at app initialization (before certificate data)
3. **Better Performance**: No need to wait for certificate fetch to get org config
4. **Scalability**: Handles unlimited organizations
5. **No Code Changes**: New orgs = database entry only
6. **Centralized Management**: Single source of truth
7. **Runtime Updates**: Change config without deployment
8. **Already Using Supabase**: Leverage existing infrastructure
9. **Backward Compatible**: Works with existing certificates and organizations

### Key Enhancement: Subdomain-Based Organization Lookup
Since you already support subdomains for white-labeled organizations, we can:
- Identify organization from subdomain immediately on app load
- Fetch org config before certificate data is loaded
- Update page title, favicon, and branding instantly
- Support both subdomain-based and certificate-based org identification (fallback)

### How Subdomain Detection Works

```
User visits: org1.certificates.com/c/abc-123
                    ↓
App extracts subdomain: "org1"
                    ↓
Fetches org config by subdomain (immediate)
                    ↓
Updates page title, favicon, logos (before certificate loads)
                    ↓
Certificate data loads (uses same org config for QR URL)
```

**Benefits:**
- ✅ Instant branding (title, favicon) before certificate loads
- ✅ Better user experience (no flash of default branding)
- ✅ Works with existing subdomain infrastructure
- ✅ Fallback to certificate-based lookup if subdomain not configured

### Implementation Plan

#### Phase 1: Database Setup
1. Create `organizations_config` table with `subdomain` column
2. Create RPC functions:
   - `get_organization_config_by_subdomain` (primary)
   - `get_organization_config_by_certificate` (fallback)
   - `get_default_organization_config` (default org fallback)
3. Create indexes on `organization_id` and `subdomain`
4. Migrate existing org data to new table

#### Phase 2: Code Refactoring
1. Create `OrganizationConfigContext` provider with subdomain detection
2. Create hooks: `useOrganizationConfig`, `useVerificationUrl`
3. Create `DynamicHead` component for meta tags
4. Update `App.tsx` to wrap with `OrganizationConfigProvider` (loads on app init)
5. Update components to use config:
   - `DisplayCertificate.tsx` - QR URL, logos
   - `Header.tsx` - Logo, link
   - `Logo.tsx` - Dynamic logo
   - `QrElement.tsx` - QR logo
   - `public/index.html` - Dynamic title (via React Helmet)

#### Phase 3: Migration
1. Create default config for existing organization
2. Test with existing certificates
3. Deploy and verify

#### Phase 4: Admin Interface (Future)
1. Build admin UI to manage org configs
2. Add validation and preview features

---

## Detailed Implementation: Option 1

### Step 1: Database Schema

```sql
-- Organizations Config Table
CREATE TABLE IF NOT EXISTS organizations_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  
  -- Subdomain Configuration ⭐
  subdomain TEXT,  -- e.g., 'org1', 'mindmerge', 'hero-vired'
  -- Note: NULL subdomain = default/main domain
  -- Multiple NULLs allowed (PostgreSQL UNIQUE constraint allows multiple NULLs)
  
  -- Branding Assets
  logo_url TEXT,
  header_logo_url TEXT,
  favicon_url TEXT,
  qr_logo_url TEXT,
  
  -- Page Metadata
  page_title TEXT DEFAULT 'Certificate',
  meta_description TEXT DEFAULT 'Digital Certificate',
  
  -- Verification URLs
  verification_domain TEXT NOT NULL,
  verification_path TEXT DEFAULT '/v/',
  verification_protocol TEXT DEFAULT 'https',
  
  -- Navigation
  header_link_url TEXT,
  
  -- Social Media (JSONB)
  social_links JSONB DEFAULT '{
    "facebook": null,
    "linkedin": null,
    "twitter": null,
    "instagram": null
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES organizations(id) 
    ON DELETE CASCADE,
  
  -- Ensure subdomain uniqueness (NULL values are allowed multiple times)
  CONSTRAINT unique_subdomain 
    UNIQUE NULLS NOT DISTINCT (subdomain)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_org_config_org_id 
  ON organizations_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_config_subdomain 
  ON organizations_config(subdomain) 
  WHERE subdomain IS NOT NULL;  -- Partial index for non-null subdomains

-- RPC Function 1: Get config by subdomain (PRIMARY METHOD)
CREATE OR REPLACE FUNCTION get_organization_config_by_subdomain(
  subdomain_param TEXT
)
RETURNS TABLE (
  logo_url TEXT,
  header_logo_url TEXT,
  favicon_url TEXT,
  qr_logo_url TEXT,
  page_title TEXT,
  meta_description TEXT,
  verification_domain TEXT,
  verification_path TEXT,
  verification_protocol TEXT,
  header_link_url TEXT,
  social_links JSONB,
  organization_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oc.logo_url,
    oc.header_logo_url,
    oc.favicon_url,
    oc.qr_logo_url,
    oc.page_title,
    oc.meta_description,
    oc.verification_domain,
    oc.verification_path,
    oc.verification_protocol,
    oc.header_link_url,
    oc.social_links,
    oc.organization_id
  FROM organizations_config oc
  WHERE oc.subdomain = subdomain_param
  LIMIT 1;
END;
$$;

-- RPC Function 2: Get config by certificate ID (FALLBACK METHOD)
CREATE OR REPLACE FUNCTION get_organization_config_by_certificate(
  cert_id UUID
)
RETURNS TABLE (
  logo_url TEXT,
  header_logo_url TEXT,
  favicon_url TEXT,
  qr_logo_url TEXT,
  page_title TEXT,
  meta_description TEXT,
  verification_domain TEXT,
  verification_path TEXT,
  verification_protocol TEXT,
  header_link_url TEXT,
  social_links JSONB,
  organization_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oc.logo_url,
    oc.header_logo_url,
    oc.favicon_url,
    oc.qr_logo_url,
    oc.page_title,
    oc.meta_description,
    oc.verification_domain,
    oc.verification_path,
    oc.verification_protocol,
    oc.header_link_url,
    oc.social_links,
    oc.organization_id
  FROM organizations_config oc
  INNER JOIN certificates c ON c.organization_id = oc.organization_id
  WHERE c.id = cert_id
  LIMIT 1;
END;
$$;

-- RPC Function 3: Get default organization config (when subdomain is NULL)
-- This can be used as a fallback when no subdomain is detected
CREATE OR REPLACE FUNCTION get_default_organization_config()
RETURNS TABLE (
  logo_url TEXT,
  header_logo_url TEXT,
  favicon_url TEXT,
  qr_logo_url TEXT,
  page_title TEXT,
  meta_description TEXT,
  verification_domain TEXT,
  verification_path TEXT,
  verification_protocol TEXT,
  header_link_url TEXT,
  social_links JSONB,
  organization_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oc.logo_url,
    oc.header_logo_url,
    oc.favicon_url,
    oc.qr_logo_url,
    oc.page_title,
    oc.meta_description,
    oc.verification_domain,
    oc.verification_path,
    oc.verification_protocol,
    oc.header_link_url,
    oc.social_links,
    oc.organization_id
  FROM organizations_config oc
  WHERE oc.subdomain IS NULL
  LIMIT 1;  -- Return first default org (you may want to add priority/ordering)
END;
$$;
```

### Step 2: TypeScript Types

```typescript
// src/types/OrganizationConfig.ts
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
}

export interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}
```

### Step 3: React Context & Hooks

```typescript
// src/context/OrganizationConfigContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationConfig } from '../types/OrganizationConfig';
import supabase from '../configs/Supabase';

interface OrgConfigContextType {
  config: OrganizationConfig | null;
  loading: boolean;
  error: Error | null;
  getVerificationUrl: (certificateId: string) => string;
}

const OrganizationConfigContext = createContext<OrgConfigContextType | undefined>(undefined);

// Utility function to extract subdomain
const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Handle localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost')) {
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
}> = ({ certificateId, children }) => {
  const [config, setConfig] = useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
            headerLinkUrl: configData.header_link_url,
            socialLinks: configData.social_links || {},
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
      value={{ config, loading, error, getVerificationUrl }}
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
```

### Step 4: Dynamic Head Component

```typescript
// src/components/DynamicHead.tsx
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
```

### Step 5: Component Updates

**DisplayCertificate.tsx** - Use config for QR URL:
```typescript
const { getVerificationUrl } = useOrganizationConfig();
const verificationUrl = getVerificationUrl(certificateData.id);
elementsData[key]["data"]["url"].set(verificationUrl);
```

**Header.tsx** - Use config for logo and link:
```typescript
const { config } = useOrganizationConfig();
<Logo src={config?.headerLogoUrl} />
<LinkOverlay href={config?.headerLinkUrl || '#'} />
```

**QrElement.tsx** - Use config for QR logo:
```typescript
const { config } = useOrganizationConfig();
const qrLogoUrl = config?.qrLogoUrl || defaultLogoUrl;
```

---

## Migration Strategy

### Step 1: Add New Table (Non-Breaking)
- Create `organizations_config` table with `subdomain` column
- Existing code continues to work

### Step 2: Populate Default Config
```sql
-- Create default config for existing organizations
-- Set subdomain based on organization slug/name if available
INSERT INTO organizations_config (
  organization_id, 
  subdomain,
  verification_domain, 
  page_title
)
SELECT 
  id,
  LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-')) as subdomain,  -- Generate from name
  'mindmerge.verification.givemycertificate.com',
  'Certificate - ' || name
FROM organizations
WHERE id NOT IN (SELECT organization_id FROM organizations_config);

-- For organizations that already have subdomains configured elsewhere,
-- you may need to manually set the subdomain:
-- UPDATE organizations_config 
-- SET subdomain = 'existing-subdomain' 
-- WHERE organization_id = 'org-uuid';
```

### Step 3: Deploy New Code
- Deploy with feature flag
- Gradually enable for organizations

### Step 4: Verify & Monitor
- Test with existing certificates
- Monitor for errors
- Rollback plan ready

---

## Onboarding New Organization Process

### Manual Process (Initial)
1. Create organization record in `organizations` table
2. Insert configuration in `organizations_config` table:
   ```sql
   INSERT INTO organizations_config (
     organization_id,
     subdomain,  -- ⭐ Set subdomain for white-labeled orgs
     verification_domain,
     logo_url,
     page_title,
     ...
   ) VALUES (
     'org-uuid',
     'org1',  -- ⭐ This enables org1.certificates.com
     'org.verification.example.com',
     'https://cdn.example.com/logo.png',
     'Certificate - Organization Name',
     ...
   );
   ```

### Subdomain Configuration Examples

**Example 1: White-labeled Organization with Subdomain**
```sql
-- Organization accessed via: hero-vired.certificates.com
INSERT INTO organizations_config (
  organization_id,
  subdomain,
  verification_domain,
  page_title,
  logo_url,
  header_logo_url,
  favicon_url
) VALUES (
  'hero-vired-uuid',
  'hero-vired',  -- ⭐ Subdomain
  'hero-vired.verification.example.com',
  'Certificate - Hero Vired',
  'https://cdn.herovired.com/logo.png',
  'https://cdn.herovired.com/header-logo.png',
  'https://cdn.herovired.com/favicon.ico'
);
```

**Example 2: Default Organization (No Subdomain)**
```sql
-- Organization accessed via: certificates.com (main domain)
INSERT INTO organizations_config (
  organization_id,
  subdomain,  -- ⭐ NULL = default/main domain
  verification_domain,
  page_title
) VALUES (
  'default-org-uuid',
  NULL,  -- ⭐ No subdomain = main domain
  'default.verification.example.com',
  'Certificate - Default Org'
);
```

### Future: Admin Dashboard
- UI to create/edit org configs
- Validation and preview
- Bulk import/export

---

## Configuration Fields Reference

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `logo_url` | TEXT | No | Main organization logo | `https://cdn.org.com/logo.png` |
| `header_logo_url` | TEXT | No | Logo for header/navbar | `https://cdn.org.com/header-logo.png` |
| `favicon_url` | TEXT | No | Favicon for browser tab | `https://cdn.org.com/favicon.ico` |
| `qr_logo_url` | TEXT | No | Logo overlay for QR code | `https://cdn.org.com/qr-logo.png` |
| `page_title` | TEXT | Yes | Browser tab title | `Certificate - Org Name` |
| `meta_description` | TEXT | No | SEO meta description | `Digital certificates by Org Name` |
| `verification_domain` | TEXT | Yes | Domain for verification | `org.verification.com` |
| `verification_path` | TEXT | No | Path prefix for verification | `/v/` or `/verify/` |
| `verification_protocol` | TEXT | No | http or https | `https` |
| `header_link_url` | TEXT | No | Link when clicking header logo | `https://org.com` |
| `social_links` | JSONB | No | Social media URLs | `{"facebook": "...", "linkedin": "..."}` |
| `subdomain` | TEXT | No | Subdomain for org identification | `org1`, `mindmerge`, `hero-vired` |

**Note on Subdomain:**
- If `subdomain` is NULL, organization uses the default/main domain
- If `subdomain` is set (e.g., `org1`), organization is accessed via `org1.certificates.com`
- Subdomain must be unique across all organizations (non-NULL values)
- Multiple organizations can have NULL subdomain (for default/main domain orgs)
- Subdomain is used as PRIMARY method to identify organization
- Lookup priority: Subdomain → Default Org (NULL subdomain) → Certificate-based fallback

---

## Security Considerations

1. **Access Control**: 
   - Ensure RPC functions have proper RLS (Row Level Security) policies
   - Only allow public read access to organization configs
   - Prevent unauthorized modifications

2. **URL Validation**: 
   - Validate verification domains to prevent open redirects
   - Whitelist allowed domains if possible
   - Sanitize user-provided URLs

3. **Image URLs**: 
   - Validate image URLs to prevent XSS
   - Use Content Security Policy (CSP) headers
   - Consider proxying images through your server

4. **CORS**: 
   - Configure CORS for external assets (logos, favicons)
   - Use trusted CDN domains only

5. **Rate Limiting**: 
   - Limit config fetch requests to prevent abuse
   - Cache config responses appropriately

6. **Subdomain Validation**:
   - Validate subdomain format (alphanumeric, hyphens only)
   - Prevent subdomain injection attacks
   - Sanitize subdomain input before database queries

---

## Performance Optimization

1. **Caching**: Cache org config in React Context (already done)
2. **CDN**: Host logos/favicons on CDN
3. **Lazy Loading**: Load images on demand
4. **Database Indexing**: 
   - Index on `organization_id` for certificate-based lookups
   - Partial index on `subdomain` (WHERE subdomain IS NOT NULL) for subdomain lookups
   - This reduces index size and improves query performance
5. **Early Loading**: Config loads at app initialization, before certificate data
6. **Single Query**: One database query per page load (subdomain lookup)

---

## Testing Checklist

### Subdomain-Based Configuration
- [ ] Organization config loads correctly from subdomain
- [ ] Subdomain extraction works for various formats:
  - [ ] `org1.certificates.com` → extracts `org1`
  - [ ] `www.certificates.com` → no subdomain (default)
  - [ ] `localhost:3000` → no subdomain (default)
  - [ ] `org1.localhost` or `org1.localhost:3000` → extracts `org1` (dev)
- [ ] Config loads immediately on app initialization
- [ ] Page title/favicon update before certificate loads

### Certificate-Based Fallback
- [ ] Falls back to certificate-based lookup if subdomain not found
- [ ] Works when accessing via main domain (no subdomain)
- [ ] Works for certificates from different orgs on same domain

### General Functionality
- [ ] New organization can be onboarded via database only
- [ ] QR code uses correct verification URL
- [ ] Page title updates dynamically
- [ ] Favicon updates correctly
- [ ] Logos display correctly
- [ ] Social links work
- [ ] Fallback to defaults if config missing
- [ ] Performance acceptable (< 100ms config fetch)
- [ ] Works with existing certificates
- [ ] Multiple organizations can coexist with different subdomains

---

## Default Organization Handling

### How Default Organization Works
When a user accesses the app via the main domain (no subdomain), the system needs to determine which organization's config to use. There are several approaches:

**Option A: Single Default Organization (Recommended)**
- One organization has `subdomain = NULL`
- This becomes the default organization
- Used when no subdomain is detected

**Option B: Certificate-Based Fallback**
- If no subdomain and no default org config found
- Fall back to certificate-based lookup
- Works for certificates accessed via main domain

**Option C: Environment Variable Fallback**
- If database lookup fails completely
- Use environment variables as final fallback
- Ensures app always has some configuration

### Recommended Approach
Use **Option A + Option B**:
1. Set one organization as default (`subdomain = NULL`)
2. If default org not found, use certificate-based lookup
3. This ensures backward compatibility

### Setting Default Organization
```sql
-- Set an organization as default (no subdomain)
UPDATE organizations_config 
SET subdomain = NULL 
WHERE organization_id = 'default-org-uuid';

-- Ensure only one default org (optional, but recommended)
-- You may want to add application-level logic to enforce this
```

---

## Integration with Existing Subdomain Infrastructure

### Current State
You mentioned you already support subdomains for white-labeled organizations. This proposal enhances that by:
1. **Storing subdomain in database** - Centralized configuration
2. **Automatic detection** - No manual routing configuration needed
3. **Config per subdomain** - Each subdomain can have unique branding

### Migration Path
If you currently have subdomain routing configured elsewhere (e.g., DNS, load balancer, etc.):
1. **Keep existing infrastructure** - DNS/routing stays the same
2. **Add subdomain to database** - Map existing subdomains to org configs
3. **App automatically detects** - No changes to routing needed

### Example Scenarios

**Scenario 1: White-labeled Organization**
```
DNS: org1.certificates.com → Points to your app
Database: subdomain = 'org1' → Links to org config
Result: App detects 'org1', loads org-specific branding
```

**Scenario 2: Default Organization**
```
DNS: certificates.com → Points to your app
Database: subdomain = NULL → Uses default org config
Result: App detects no subdomain, uses default branding
```

**Scenario 3: Multiple Organizations**
```
DNS: 
  - org1.certificates.com → Points to your app
  - org2.certificates.com → Points to your app
  - certificates.com → Points to your app

Database:
  - org1 → org1 config
  - org2 → org2 config
  - NULL → default config

Result: Each subdomain gets its own branding automatically
```

## Next Steps

1. **Review this proposal** - Confirm subdomain-based approach works for your infrastructure
2. **Approve database schema** - Including subdomain column and indexes
3. **Map existing subdomains** - Document which subdomains map to which organizations
4. **Create implementation plan** - With timeline and migration steps
5. **Begin Phase 1** - Database setup and migration
6. **Iterate** - Based on feedback and testing

