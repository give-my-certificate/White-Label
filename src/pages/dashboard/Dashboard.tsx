import React from 'react'
import { Route, BrowserRouter as Router, Switch, useLocation } from 'react-router-dom'
import { Header } from '../../components/header/Header'
import { MainSection } from '../../layout/mainSection/MainSection'
import { DisplayCertificate } from '../displayCertificate/DisplayCertificate'
import { Unknown } from '../unknown/Unknown'

const ConditionalHeader: React.FC = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/c/')) return null;
    return <Header />;
};

const ConditionalMainSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    if (location.pathname.startsWith('/c/')) {
        return <>{children}</>;
    }
    return <MainSection>{children}</MainSection>;
};

export default function Dashboard() {
    return (
        <Router>
            <ConditionalHeader />
            <ConditionalMainSection>
                <Switch>
                    <Route path="/c/:id" component={DisplayCertificate} />
                    <Route path="/" component={Unknown} />
                </Switch>
            </ConditionalMainSection>
        </Router>
    )
}
