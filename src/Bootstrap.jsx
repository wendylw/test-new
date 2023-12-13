import React, { Component, lazy, Suspense } from 'react';
import { Route, Redirect, Switch, BrowserRouter as Router } from 'react-router-dom';
import qs from 'qs';
import { ErrorBoundary } from '@sentry/react';
import { Translation } from 'react-i18next';
import Constants from './utils/constants';
import Utils from './utils/utils';
import NotFound from './containers/NotFound';
import ErrorComponent from './components/Error';
import i18n from './i18n';
import 'react-loading-skeleton/dist/skeleton.css';
import './Bootstrap.scss';
import * as NativeMethods from './utils/native-methods';
import logger from './utils/monitoring/logger';
import { initDevTools } from './utils/dev-tools';
import { isRequiredDevTools } from './utils/tng-utils';
import './utils/growthbook/setup';

const AsyncStoresApp = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "STO" */ './stores')));

const AsyncOrdering = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "ORD" */ './ordering')));

const AsyncCashbackApp = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "CB" */ './cashback')));

const AsyncSite = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "SITE" */ './site')));

const AsyncVoucher = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "VOU" */ './voucher')));

const AsyncRewards = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "RWD" */ './rewards')));

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;

class Bootstrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remountKey: Date.now(),
    };
  }

  componentDidMount() {
    window.addEventListener('pageshow', this.handlePageShow);
  }

  componentWillUnmount() {
    window.removeEventListener('pageshow', this.handlePageShow);
  }

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
    logger.error('Common_RenderError', {
      id: eventId,
      message: error?.message,
    });
  };

  handlePageShow = event => {
    if (event.persisted) {
      // Trigger remount all components, for fixing back cache
      // Fixed Issues: https://storehub.atlassian.net/browse/BEEP-784
      this.setState({
        remountKey: Date.now(),
      });
    }
  };

  onErrorScreenBackToHomeButtonClick = () => {
    if (Utils.isWebview()) {
      NativeMethods.gotoHome();
    } else {
      document.location.href = '/';
    }
  };

  renderSitePages = () => (
    <Suspense fallback={<div className="loader theme full-page" />}>
      <Switch>
        <Route path={ROUTER_PATHS.REWARDS_BASE} component={AsyncRewards} />
        <Route path="*" component={AsyncSite} />
      </Switch>
    </Suspense>
  );

  renderMerchantPages = () => (
    <Suspense fallback={<div className="loader theme full-page" />}>
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
        <Route path={ROUTER_PATHS.ORDERING_BASE} component={AsyncOrdering} />
        <Route path={ROUTER_PATHS.CASHBACK_BASE} component={AsyncCashbackApp} />
        <Route path={ROUTER_PATHS.VOUCHER_HOME} component={AsyncVoucher} />
        <Route path={ROUTER_PATHS.DINE} component={AsyncStoresApp} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  );

  renderError = ({ eventId }) => (
    <Translation i18n={i18n}>
      {t => (
        <main className="fixed-wrapper fixed-wrapper__main bootstrap__render-error">
          <ErrorComponent title={t('CommonErrorMessage')} description={t('ErrorId', { id: eventId })}>
            <footer className="footer footer__white flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
              <button
                className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
                data-test-id="common.render-error.back-btn"
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

  render() {
    const { remountKey } = this.state;

    return (
      <ErrorBoundary fallback={this.renderError} onError={this.handleError}>
        <Router key={remountKey}>{Utils.isSiteApp() ? this.renderSitePages() : this.renderMerchantPages()}</Router>
      </ErrorBoundary>
    );
  }
}

// enable dev-tools in tng mini-program
(async () => {
  try {
    const result = await isRequiredDevTools();
    if (result) {
      initDevTools();
    }
  } catch {
    // DO nothing
  }
})();

Bootstrap.displayName = 'Bootstrap';

export default Bootstrap;
