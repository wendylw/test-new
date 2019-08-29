import React, { Component, lazy } from 'react';
import Loadable from 'react-loadable';
import { Route, Redirect, Switch } from "react-router-dom";
import Constants from './Constants';
import Utils from './libs/utils';

const Loading = () => <div className="loader theme page-loader"></div>;

const AsyncTermsPrivacy = lazy(() => import('./containers/TermsPrivacy'));

const AsyncStoresApp = lazy(() => import('./containers/Stores'));

const AsyncNotFound = lazy(() => import('./containers/NotFound'));

const AsyncOrdering = lazy(() => import('./ordering'));

const AsyncCashbackApp = lazy(() => import('./cashback/App'));

const AsyncQRScanner = lazy(() => import('./qrscan'));

class Bootstrap extends Component {
  render() {
    return (
      <React.Fragment>
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
          <Route component={AsyncNotFound} />
          <Route path={Constants.ROUTER_PATHS.ORDERING} component={AsyncOrdering} />
          <Route path={Constants.ROUTER_PATHS.CASHBACK} component={AsyncCashbackApp} />
          <Route path={Constants.ROUTER_PATHS.QRSCAN} component={AsyncQRScanner} />
        </Switch>
      </React.Fragment>
    );
  }
}

const isQRScannerApp = () => {
  return (process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',').includes(document.location.hostname);
}

export default Bootstrap;
