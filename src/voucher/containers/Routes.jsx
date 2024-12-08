import React, { lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';
import Utils from '../../utils/utils';
import NotFound from '../../containers/NotFound';
import Constants from '../../utils/constants';
import Home from './Home';
import Contact from './Contact';
import PageLoader from '../components/PageLoader';

const { ROUTER_PATHS } = Constants;

const ThankYou = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "VOU_TY" */ './ThankYou')));
const Sorry = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "VOU_SRY" */ './Sorry')));

const Routes = () => (
  <Router>
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route exact path={ROUTER_PATHS.VOUCHER_HOME} component={Home} />
        <Route exact path={ROUTER_PATHS.VOUCHER_CONTACT} component={Contact} />
        <Route exact path={ROUTER_PATHS.VOUCHER_SORRY} component={Sorry} />
        <Route exact path={ROUTER_PATHS.VOUCHER_THANK_YOU} component={ThankYou} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </Router>
);

Routes.displayName = 'VoucherRoutes';

export default withRouter(Routes);
