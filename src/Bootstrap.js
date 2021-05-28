import React, { Component, lazy, Suspense } from 'react';
import { Route, Redirect, Switch, BrowserRouter as Router } from 'react-router-dom';
import qs from 'qs';
import Constants from './utils/constants';
import Utils from './utils/utils';
import NotFound from './containers/NotFound';
import { ErrorBoundary } from '@sentry/react';
import ErrorComponent from './components/Error';
import { Translation } from 'react-i18next';
import i18n from './i18n';
import './Bootstrap.scss';
import { gotoHome } from './utils/webview-utils';
import loggly from './utils/monitoring/loggly';

const AsyncTermsPrivacy = lazy(() => Utils.attemptLoad(() => import('./containers/TermsPrivacy')));

const AsyncStoresApp = lazy(() => Utils.attemptLoad(() => import('./stores')));

const AsyncOrdering = lazy(() => Utils.attemptLoad(() => import('./ordering')));

const AsyncCashbackApp = lazy(() => Utils.attemptLoad(() => import('./cashback')));

const AsyncQRScanner = lazy(() => Utils.attemptLoad(() => import('./qrscan')));

const AsyncSite = lazy(() => Utils.attemptLoad(() => import('./site')));

const AsyncVoucher = lazy(() => Utils.attemptLoad(() => import('./voucher')));

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;

class Bootstrap extends Component {
  handleError = (error, componentStack, eventId) => {
    window.newrelic?.addPageAction('common.render-error', {
      error: error?.message,
      stack: error?.stack,
      componentStack,
      sentryId: eventId,
      pathname: document.location.pathname,
      host: document.location.host,
      href: document.location.href,
    });
    loggly.error('common.render-error', {
      sentryId: eventId,
      errorMessage: error?.message,
    });
  };

  onErrorScreenBackToHomeButtonClick = () => {
    if (Utils.isWebview()) {
      gotoHome();
    } else {
      document.location.href = '/';
    }
  };

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

  renderError = ({ eventId }) => {
    return (
      <Translation i18n={i18n}>
        {t => (
          <main className="fixed-wrapper fixed-wrapper__main bootstrap__render-error">
            <ErrorComponent title={t('CommonErrorMessage')} description={t('ErrorId', { id: eventId })}>
              <footer className="footer footer__white flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
                <button
                  className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
                  onClick={this.onErrorScreenBackToHomeButtonClick}
                >
                  {t('BackToHome')}
                </button>
              </footer>
            </ErrorComponent>
          </main>
        )}
      </Translation>
    );
  };

  render() {
    return (
      <ErrorBoundary fallback={this.renderError} onError={this.handleError}>
        <Router>{Utils.isSiteApp() ? this.renderSitePages() : this.renderMerchantPages()}</Router>
      </ErrorBoundary>
    );
  }
}

export default Bootstrap;
