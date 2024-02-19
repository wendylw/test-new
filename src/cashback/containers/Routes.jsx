import React, { lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Utils from '../../utils/utils';
import NotFound from '../../containers/NotFound';

const RecentActivities = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "CB_RA" */ './RecentActivities'))
);
const ClaimCashback = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "CB_CL" */ './ClaimCashback')));
const Home = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "CB_HM" */ './Home')));
const StoreRedemption = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "CB_SR" */ './StoreRedemption'))
);
const Error = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "CB_ERR" */ './Error')));

const Routes = ({ match }) => (
  <Router basename={match.path}>
    <Suspense
      fallback={
        <div className="loading-cover">
          <i className="loader theme full-page" />
        </div>
      }
    >
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/claim" component={ClaimCashback} />
        <Route exact path="/activities" component={RecentActivities} />
        <Route exact path="/store-redemption" component={StoreRedemption} />
        <Route exact path="/error" component={Error} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </Router>
);

Routes.displayName = 'CashbackRoutes';

Routes.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
  }),
};

Routes.defaultProps = {
  match: {
    path: '',
  },
};

export default withRouter(Routes);
