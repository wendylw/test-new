import React, { lazy, Suspense } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import Utils from '../../utils/utils';
import { PATH_NAME_MAPPING } from '../../common/utils/constants';
import NotFound from '../../containers/NotFound';
import history from '../rewardsHistory';

const MembershipFormProxy = lazy(() =>
  Utils.attemptLoad(() =>
    import(/* webpackChunkName: "RWD_MF" */ './Business/containers/MembershipForm/MembershipFormProxy')
  )
);

const MembershipDetail = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_MER_DETL" */ './Business/containers/MembershipDetail'))
);

const SeamlessLoyalty = lazy(() =>
  Utils.attemptLoad(() =>
    import(/* webpackChunkName: "RWD_SL" */ './Business/containers/SeamlessLoyalty/SeamlessLoyaltyProxy')
  )
);

const ClaimUniquePromoProxy = lazy(() =>
  Utils.attemptLoad(() =>
    import(/* webpackChunkName: "RWD_CL_UQ_PROM" */ './Business/containers/ClaimUniquePromo/ClaimUniquePromoProxy')
  )
);

const Login = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_Login" */ './Login')));

const Routes = () => (
  <ConnectedRouter history={history}>
    <Suspense fallback={<div className="loader theme full-page" />}>
      <Switch>
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.SIGN_UP}`}
          component={MembershipFormProxy}
        />
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}`}
          component={MembershipDetail}
        />
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.SEAMLESS_LOYALTY}`}
          component={SeamlessLoyalty}
        />
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.CLAIM}`}
          component={ClaimUniquePromoProxy}
        />
        <Route exact path={PATH_NAME_MAPPING.REWARDS_LOGIN} component={Login} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </ConnectedRouter>
);

Routes.displayName = 'RewardsRoutes';

export default withRouter(Routes);
