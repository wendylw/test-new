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
  Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_MER_DETL" */ './Business/containers/MembershipDetailV2'))
);

const PointsHistory = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_PH" */ './Business/containers/PointsHistory'))
);

const CashbackCreditsHistory = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_PH" */ './Business/containers/CashbackCreditsHistory'))
);

const UniquePromoListPage = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_UP" */ './Business/containers/UniquePromoListPage'))
);

const MyRewardDetail = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "MY_RWD" */ './Business/containers/MyRewardDetail'))
);

const PointsRewardsPage = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_UP" */ './Business/containers/PointsRewardsPage'))
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

const CashbackDetail = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "RWD_CBD" */ './Business/containers/CashbackDetail'))
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
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.POINTS_HISTORY}`}
          component={PointsHistory}
        />
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.CASHBACK_CREDITS_HISTORY}`}
          component={CashbackCreditsHistory}
        />
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.POINTS_REWARDS}${PATH_NAME_MAPPING.LIST}`}
          component={PointsRewardsPage}
        />
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`}
          component={UniquePromoListPage}
        />
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.DETAIL}`}
          component={MyRewardDetail}
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
        <Route
          exact
          path={`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.CASHBACK}${PATH_NAME_MAPPING.CASHBACK_DETAIL}`}
          component={CashbackDetail}
        />
        <Route exact path={PATH_NAME_MAPPING.REWARDS_LOGIN} component={Login} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </ConnectedRouter>
);

Routes.displayName = 'RewardsRoutes';

export default withRouter(Routes);
