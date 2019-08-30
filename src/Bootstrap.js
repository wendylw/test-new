import React, { Component, lazy, Suspense } from 'react';
import { Route, Redirect, Switch, BrowserRouter as Router } from "react-router-dom";
import Constants from './Constants';
import Utils from './libs/utils';

const AsyncTermsPrivacy = lazy(() => import('./containers/TermsPrivacy'));

const AsyncStoresApp = lazy(() => import('./containers/Stores'));

const AsyncNotFound = lazy(() => import('./containers/NotFound'));

const AsyncOrdering = lazy(() => import('./ordering'));

const AsyncCashbackApp = lazy(() => import('./cashback'));

const AsyncQRScanner = lazy(() => import('./qrscan'));

class Bootstrap extends Component {
  render() {
    return (
      <Router>
        <Suspense fallback={<div className="loader theme page-loader"></div>}>
          <Switch>
            <Route
              path={Constants.ROUTER_PATHS.TERMS_OF_USE}
              render={props => <AsyncTermsPrivacy {...props} pageName='terms' />}
            />
            <Route
              path={Constants.ROUTER_PATHS.PRIVACY}
              render={props => <AsyncTermsPrivacy {...props} pageName='privacy' />}
            />
            <Route exact path={Constants.ROUTER_PATHS.INDEX} render={(...args) => {
              if (isQRScannerApp()) {
                return (
                  <Redirect to={Constants.ROUTER_PATHS.QRSCAN} />
                );
              }
              // goto stores when visit home page without scaning QR Code.
              if (!Utils.getQueryString('h')) {
                return <AsyncStoresApp />
              }

              return (
                <Redirect to={Constants.ROUTER_PATHS.ORDERING} />
              );
            }} />
            <Route path={Constants.ROUTER_PATHS.ORDERING} component={AsyncOrdering} />
            <Route path={Constants.ROUTER_PATHS.CASHBACK} component={AsyncCashbackApp} />
            <Route path={Constants.ROUTER_PATHS.QRSCAN} component={AsyncQRScanner} />
            <Route component={AsyncNotFound} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

const isQRScannerApp = () => {
  return (process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',').includes(document.location.hostname);
}

export default Bootstrap;
