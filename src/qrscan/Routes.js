import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Constants from './Constants';
import Scan from './containers/Scan';
import Permission from './containers/Permission';
import NotSupport from './containers/NotSupport';

const BasicRoute = () => (
  <Route basename="/qrscan">
    <Switch>
      <Route exact path={Constants.ALL_ROUTER.scan} component={Scan} />
      <Route path={Constants.ALL_ROUTER.permission} component={Permission} />
      <Route path={Constants.ALL_ROUTER.notSupport} component={NotSupport} />
    </Switch>
  </Route>
);

export default BasicRoute;