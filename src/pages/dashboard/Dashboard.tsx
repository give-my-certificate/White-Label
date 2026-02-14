import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { Header } from '../../components/header/Header'
import { MainSection } from '../../layout/mainSection/MainSection'
import { DisplayCertificate } from '../displayCertificate/DisplayCertificate'
import { Unknown } from '../unknown/Unknown'
import { useOrganizationConfig } from '../../context/OrganizationConfigContext'

// Test component to verify context is working
const TestContext: React.FC = () => {
  const { config, loading, error } = useOrganizationConfig();
  
  if (loading) {
    return <div>Loading configuration...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div style={{padding: '20px', backgroundColor: '#f0f0f0', margin: '20px 0'}}>
      <h3>Organization Config Debug:</h3>
      <p><strong>Page Title:</strong> {config?.pageTitle}</p>
      <p><strong>Meta Description:</strong> {config?.metaDescription}</p>
      <p><strong>Verification Domain:</strong> {config?.verificationDomain}</p>
      <p><strong>Organization ID:</strong> {config?.organizationId}</p>
      <p><strong>Header Logo URL:</strong> {config?.headerLogoUrl}</p>
      <p><strong>Subdomain:</strong> {window.location.hostname}</p>
    </div>
  );
};

export default function Dashboard() {
    return (
        <>
            <Header />
            <MainSection>
                <Router>
                    <Switch>
                        <Route path="/c/:id" component={DisplayCertificate} />
                        <Route path="/test" component={TestContext} />
                        <Route path="/" component={Unknown} />
                    </Switch>
                </Router>
            </MainSection>
        </>
    )
}
