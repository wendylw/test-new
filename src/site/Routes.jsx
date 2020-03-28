import React from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import Home from './home';
import Account from './account';
import QRScan from './qrscan';
import NotFound from './common/components/NotFound';
import Auth from './auth';
import ProtectedRoute from './common/components/ProtectedRoute';

const SiteRoute = () => {
  return (
    <Switch>
      <Route path={`/home`} component={Home} />
      <Route path={`/qrscan`} component={QRScan} />
      <Route path={`/auth`} component={Auth} />
      <ProtectedRoute path={`/account`}>
        <Account />
      </ProtectedRoute>
      <Redirect from={`/`} to={`/home`} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default withRouter(SiteRoute);
