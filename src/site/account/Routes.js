import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import AccountHome from './containers/AccountHome';
import AccountOrders from './containers/AccountOrders';
import AccountCashback from './containers/AccountCashback';
import AccountAddress from './containers/AccountAddress';
import NotFound from '../common/components/NotFound';

const AccountRoute = () => {
  const match = useRouteMatch();
  console.log('AccountRoute match.path', match.path);

  return (
    <Switch>
      <Route path={`${match.path}/orders`} exact component={AccountOrders} />
      <Route path={`${match.path}/cashback`} exact component={AccountCashback} />
      <Route path={`${match.path}/address`} exact component={AccountAddress} />
      <Route path={`${match.path}/`} exact component={AccountHome} />
      <Route path={`${match.path}/*`} component={NotFound} />
    </Switch>
  );
};

export default AccountRoute;
