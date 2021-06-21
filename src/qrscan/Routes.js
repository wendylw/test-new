import React from 'react';
import { Route, Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import Constants from './Constants';
import Scan from './containers/Scan';
import Permission from './containers/Permission';
import NotSupport from './containers/NotSupport';

const NotFound = () => {
  return <Redirect to={'/'} />;
};
NotFound.displayName = 'QRScanNotFound';

const BasicRoute = () => (
  <Router basename="/qrscan">
    <Switch>
      <Route exact path={Constants.ALL_ROUTER.scan} component={Scan} />
      <Route exact path={Constants.ALL_ROUTER.permission} component={Permission} />
      <Route path={Constants.ALL_ROUTER.notSupport} component={NotSupport} />
      <Route path={'*'} component={NotFound} />
    </Switch>
  </Router>
);
BasicRoute.displayName = 'QRScanBasicRoute';

export default BasicRoute;
