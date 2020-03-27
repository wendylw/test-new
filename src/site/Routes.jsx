import React from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import Landing from './landing';
import Account from './account';
import QRScan from './qrscan';
import NotFound from './common/components/NotFound';
import Auth from './auth';
import ProtectedRoute from './common/components/ProtectedRoute';

const SiteRoute = () => {
  return (
    <Switch>
      <Route path={`/landing`} component={Landing} />
      <Route path={`/qrscan`} component={QRScan} />
      <Route path={`/auth`} component={Auth} />
      <ProtectedRoute path={`/account`}>
        <Account />
      </ProtectedRoute>
      <Redirect from={`/`} to={`/landing`} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default withRouter(SiteRoute);
