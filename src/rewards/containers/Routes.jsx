import React, { lazy, Suspense } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import Utils from '../../utils/utils';
import Constants from '../../utils/constants';
import NotFound from '../../containers/NotFound';
import history from '../rewardsHistory';

const MembershipFormProxy = lazy(() =>
  Utils.attemptLoad(() =>
    import(/* webpackChunkName: "RWD_MF" */ './Business/containers/MembershipForm/MembershipFormProxy')
  )
);

const Login = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_Login" */ './Login')));

const { ROUTER_PATHS } = Constants;

const Routes = () => (
  <ConnectedRouter history={history}>
    <Suspense fallback={<div className="loader theme full-page" />}>
      <Switch>
        <Route
          exact
          path={`${ROUTER_PATHS.REWARDS_BUSINESS}${ROUTER_PATHS.JOIN_MEMBERSHIP}`}
          component={MembershipFormProxy}
        />
        <Route exact path={ROUTER_PATHS.REWARDS_LOGIN} component={Login} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </ConnectedRouter>
);

Routes.displayName = 'RewardsRoutes';

export default withRouter(Routes);
