import React from 'react';
import { useOrganizationConfig } from './context/OrganizationConfigContext';

export const TestComponent: React.FC = () => {
  const { config, loading, error } = useOrganizationConfig();
  
  console.log('TestComponent - Config:', { config, loading, error });
  
  if (loading) {
    return <div>Loading configuration...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  if (!config) {
    return <div>No configuration found</div>;
  }
  
  return (
    <div>
      <h1>{config.pageTitle}</h1>
      <p>{config.metaDescription}</p>
      <p>Verification Domain: {config.verificationDomain}</p>
      <p>Organization ID: {config.organizationId}</p>
    </div>
  );
};