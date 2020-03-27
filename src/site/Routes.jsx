import React from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import Landing from './landing';
import Account from './account';
import QRScan from './qrscan';
import NotFound from './common/components/NotFound';
import Auth from './auth';

const SiteRoute = () => {
  return (
    <Switch>
      <Route path={`/landing`} component={Landing} />
      <Route path={`/qrscan`} component={QRScan} />
      <Route path={`/account`} component={Account} />
      <Route path={`/auth`} component={Auth} />
      <Redirect from={`/`} to={`/landing`} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default withRouter(SiteRoute);
