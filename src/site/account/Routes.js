import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import AccountHome from './containers/AccountHome';

const NotFound = () => {
  return <Redirect to={'/'} />;
};

const AccountRoute = () => {
  const match = useRouteMatch();
  console.log('AccountRoute match.path', match.path);

  return (
    <Switch>
      <Route path={`${match.path}/home`} exact component={AccountHome} />
      <Redirect from={`${match.path}/`} to={`${match.path}/home`} />
      <Route path={`${match.path}/*`} component={NotFound} />
    </Switch>
  );
};

export default AccountRoute;
