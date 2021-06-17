import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';
import Utils from '../../utils/utils';
import NotFound from '../../containers/NotFound';
import Constants from '../../utils/constants';
import Home from './Home';
import Contact from './Contact';
import PageLoader from '../components/PageLoader';

const { ROUTER_PATHS } = Constants;

const ThankYou = lazy(() => Utils.attemptLoad(() => import('./ThankYou')));
const Sorry = lazy(() => Utils.attemptLoad(() => import('./Sorry')));

class Routes extends Component {
  render() {
    return (
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route exact path={ROUTER_PATHS.VOUCHER_HOME} component={Home} />
            <Route exact path={ROUTER_PATHS.VOUCHER_CONTACT} component={Contact} />
            <Route exact path={ROUTER_PATHS.VOUCHER_SORRY} component={Sorry} />
            <Route exact path={ROUTER_PATHS.VOUCHER_THANK_YOU} component={ThankYou} />
            <Route path={'*'} component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}
Routes.displayName = 'Routes';

export default withRouter(Routes);
