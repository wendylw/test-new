import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import AuthLogin from './containers/AuthLogin';
import AuthOtp from './containers/AuthOtp';

const AccountRoute = () => {
  const match = useRouteMatch();
  console.log('AuthRoute match.path', match.path);

  return (
    <Switch>
      <Route path={`${match.path}/login`} exact component={AuthLogin} />
      <Route path={`${match.path}/otp`} exact component={AuthOtp} />
    </Switch>
  );
};

export default AccountRoute;
