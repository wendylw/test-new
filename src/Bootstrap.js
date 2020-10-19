import React, { Component, lazy, Suspense } from 'react';
import { Route, Redirect, Switch, BrowserRouter as Router } from 'react-router-dom';
import qs from 'qs';
import Constants from './utils/constants';
import Utils from './utils/utils';
import NotFound from './NotFound';

const AsyncTermsPrivacy = lazy(() => Utils.retry(() => import('./containers/TermsPrivacy')));

const AsyncStoresApp = lazy(() => Utils.retry(() => import('./stores')));

const AsyncOrdering = lazy(() => Utils.retry(() => import('./ordering')));

const AsyncCashbackApp = lazy(() => Utils.retry(() => import('./cashback')));

const AsyncQRScanner = lazy(() => Utils.retry(() => import('./qrscan')));

const AsyncSite = lazy(() => Utils.retry(() => import('./site')));

const AsyncVoucher = lazy(() => Utils.retry(() => import('./voucher')));

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;

class Bootstrap extends Component {
  renderSitePages = () => {
    return (
      <Suspense fallback={<div className="loader theme full-page"></div>}>
        <AsyncSite />
      </Suspense>
    );
  };

  renderMerchantPages = () => {
    return (
      <Suspense fallback={<div className="loader theme full-page"></div>}>
        <Switch>
          <Route
            exact
            path={ROUTER_PATHS.STORES_HOME}
            render={routeProps => {
              const queries = qs.parse(routeProps.location.search, { ignoreQueryPrefix: true });

              // goto stores when visit home page without scaning QR Code.
              if (!queries.h) {
                return <AsyncStoresApp />;
              }

              // if type is empty then fallback to dine-in order
              queries.type = queries.type || DELIVERY_METHOD.DINE_IN;
              return (
                <Redirect
                  to={{
                    pathname: ROUTER_PATHS.ORDERING_BASE + ROUTER_PATHS.ORDERING_HOME,
                    search: qs.stringify(queries, { addQueryPrefix: true }),
                  }}
                />
              );
            }}
          />
          <Route path={ROUTER_PATHS.TERMS_OF_USE} render={props => <AsyncTermsPrivacy {...props} pageName="terms" />} />
          <Route path={ROUTER_PATHS.PRIVACY} render={props => <AsyncTermsPrivacy {...props} pageName="privacy" />} />
          <Route path={ROUTER_PATHS.ORDERING_BASE} component={AsyncOrdering} />
          <Route path={ROUTER_PATHS.CASHBACK_BASE} component={AsyncCashbackApp} />
          <Route path={ROUTER_PATHS.QRSCAN} component={AsyncQRScanner} />
          <Route path={ROUTER_PATHS.VOUCHER_HOME} component={AsyncVoucher} />
          <Route path={ROUTER_PATHS.DINE} component={AsyncStoresApp} />
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
