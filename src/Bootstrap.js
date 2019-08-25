import React, { Component } from 'react';
import Loadable from 'react-loadable';
import { Route, Redirect, Switch } from "react-router-dom";
import Constants from './Constants';
import Utils from './libs/utils';

const Loading = () => <div className="loader theme page-loader"></div>;

// const AsyncOrderingApp = Loadable({
//   loader: () => import("./App"),
//   loading: Loading,
// })

const AsyncCashbackApp = Loadable({
  loader: () => import("./cashback/App"),
  loading: Loading,
})

const AsyncQRScanner = Loadable({
  loader: () => import("./qrscan"),
  loading: Loading,
})

const AsyncStoresApp = Loadable({
  loader: () => import("./containers/Stores/index"),
  loading: Loading,
})

const AsyncTermsPrivacy = Loadable({
  loader: () => import("./containers/TermsPrivacy"),
  loading: Loading,
})

const AsyncReduxDemo = Loadable({
  loader: () => import("./ordering-demo/index"),
  loading: Loading,
})

const AsyncNotFound = Loadable({
  loader: () => import("./containers/NotFound"),
  loading: Loading,
});

class Bootstrap extends Component {
  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route path={Constants.ROUTER_PATHS.ORDERING} component={AsyncReduxDemo} />
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
          {/* <Route path={Constants.ROUTER_PATHS.ORDERING} component={AsyncOrderingApp} /> */}
          <Route path={Constants.ROUTER_PATHS.CASHBACK} component={AsyncCashbackApp} />
          <Route path={Constants.ROUTER_PATHS.QRSCAN} component={AsyncQRScanner} />
          <Route
            path={Constants.ROUTER_PATHS.TERMS_OF_USE}
            render={props => <AsyncTermsPrivacy {...props} pageName='terms' />}
          />
          <Route
            path={Constants.ROUTER_PATHS.PRIVACY}
            render={props => <AsyncTermsPrivacy {...props} pageName='privacy' />}
          />
          <Route component={AsyncNotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const isQRScannerApp = () => {
  return (process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',').includes(document.location.hostname);
}

export default Bootstrap;
