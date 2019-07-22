import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Scan from './containers/Scan';


const BASE_URL = "/qrscan/";
const ALL_ROUTER = {
  scan: BASE_URL
}

const BasicRoute = () => (
  <Switch>
    <Route exact path={ALL_ROUTER.scan} component={Scan} />
  </Switch>
);

export default BasicRoute;