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

const AsyncSite = lazy(() => import('./site'));

const AsyncVoucher = lazy(() => import('./voucher'));

const { ROUTER_PATHS } = Constants;

class Bootstrap extends Component {
  renderSitePages = () => {
    return (
      <Suspense fallback={<div className="loader theme page-loader"></div>}>
        <AsyncSite />
      </Suspense>
    );
  };

  renderMerchantPages = () => {
    return (
      <Suspense fallback={<div className="loader theme page-loader"></div>}>
        <Switch>
          <Route
            exact
            path={ROUTER_PATHS.STORES_HOME}
            render={(...args) => {
              // goto stores when visit home page without scaning QR Code.
              if (!Utils.getQueryString('h')) {
                return <AsyncStoresApp />;
              }

              return <Redirect to={ROUTER_PATHS.ORDERING_BASE} />;
            }}
          />
          <Route path={ROUTER_PATHS.TERMS_OF_USE} render={props => <AsyncTermsPrivacy {...props} pageName="terms" />} />
          <Route path={ROUTER_PATHS.PRIVACY} render={props => <AsyncTermsPrivacy {...props} pageName="privacy" />} />
          <Route path={ROUTER_PATHS.ORDERING_BASE} component={AsyncOrdering} />
          <Route path={ROUTER_PATHS.CASHBACK_BASE} component={AsyncCashbackApp} />
          <Route path={ROUTER_PATHS.QRSCAN} component={AsyncQRScanner} />
          <Route path={ROUTER_PATHS.VOUCHER_HOME} component={AsyncVoucher} />
          <Route path={'*'} component={NotFound} />
        </Switch>
      </Suspense>
    );
  };

  render() {
    return <Router>{Utils.isSiteApp() ? this.renderSitePages() : this.renderMerchantPages()}</Router>;
  }
}

export default Bootstrap;
