import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';
import NotFound from '../../NotFound';
import Constants from '../../utils/constants';
import Home from './Home';
import Contact from './Contact';

const { ROUTER_PATHS } = Constants;

const ThankYou = lazy(() => import('./ThankYou'));
const Sorry = lazy(() => import('./Sorry'));

class Routes extends Component {
  render() {
    return (
      <Router>
        <Suspense fallback={<div className="loader theme page-loader"></div>}>
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

export default withRouter(Routes);
