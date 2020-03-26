import React, { Component, lazy, Suspense } from 'react';
import { Route, Redirect, Switch, BrowserRouter as Router } from 'react-router-dom';
import Constants from './utils/constants';
import Utils from './utils/utils';
import NotFound from './NotFound';

const AsyncTermsPrivacy = lazy(() => import('./containers/TermsPrivacy'));

const AsyncStoresApp = lazy(() => import('./stores'));

const AsyncOrdering = lazy(() => import('./ordering'));

const AsyncCashbackApp = lazy(() => import('./cashback'));

const AsyncQRScanner = lazy(() => import('./qrscan'));

const { ROUTER_PATHS } = Constants;

class Bootstrap extends Component {
  render() {
    return (
      <Router>
        <Suspense fallback={<div className="loader theme page-loader"></div>}>
          <Switch>
            <Route
              path={ROUTER_PATHS.TERMS_OF_USE}
              render={props => <AsyncTermsPrivacy {...props} pageName="terms" />}
            />
            <Route path={ROUTER_PATHS.PRIVACY} render={props => <AsyncTermsPrivacy {...props} pageName="privacy" />} />
            <Route
              exact
              path={ROUTER_PATHS.STORES_HOME}
              render={(...args) => {
                if (isQRScannerApp()) {
                  return <Redirect to={ROUTER_PATHS.QRSCAN} />;
                }

                // goto stores when visit home page without scaning QR Code.
                if (!Utils.getQueryString('h')) {
                  return <AsyncStoresApp />;
                }

                return <Redirect to={ROUTER_PATHS.ORDERING_BASE} />;
              }}
            />
            <Route path={ROUTER_PATHS.ORDERING_BASE} component={AsyncOrdering} />
            <Route path={ROUTER_PATHS.CASHBACK_BASE} component={AsyncCashbackApp} />
            <Route path={ROUTER_PATHS.QRSCAN} component={AsyncQRScanner} />
            <Route path={'*'} component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

const isQRScannerApp = () => {
  return (process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',').includes(document.location.hostname);
};

export default Bootstrap;
