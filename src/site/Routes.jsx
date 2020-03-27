import React from 'react';
import { Route, Switch, Redirect, useRouteMatch, withRouter } from 'react-router-dom';
import Landing from './landing';
import Account from './account';
import QRScan from './qrscan';

const NotFound = () => {
  return <Redirect to={'/'} />;
};

const SiteRoute = () => {
  const match = useRouteMatch();

  console.log('SiteRoute match.path', match.path);

  return (
    <Switch>
      <Route path={`${match.path}/home`} component={Landing} />
      <Route path={`${match.path}/qrscan`} component={QRScan} />
      <Route path={`${match.path}/account`} component={Account} />
      <Redirect from={`${match.path}/`} to={`${match.path}/home`} />
      <Route path={`${match.path}/*`} component={NotFound} />
    </Switch>
  );
};

export default withRouter(SiteRoute);
