import React, { lazy } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Constants from '../utils/constants';

const { ROUTER_PATHS } = Constants;

const Home = lazy(() => import(/* webpackChunkName: "SITE_HM" */ './home'));
const Auth = lazy(() => import(/* webpackChunkName: "SITE_AUTH" */ './auth'));
const QRScan = lazy(() => import(/* webpackChunkName: "SITE_QRSCN" */ './qrscan'));
const Account = lazy(() => import(/* webpackChunkName: "SITE_ACT" */ './account'));
const OrderHistory = lazy(() => import(/* webpackChunkName: "SITE_OH" */ './order-history'));
const SearchPage = lazy(() => import(/* webpackChunkName: "SITE_SP" */ './search/SearchPage'));
const Location = lazy(() => import(/* webpackChunkName: "SITE_LOC" */ './ordering/containers/Location'));
const CollectionPage = lazy(() => import(/* webpackChunkName: "SITE_CP" */ './collections/CollectionPage'));
const AsyncTermsPrivacy = lazy(() => import(/* webpackChunkName: "SITE_TP" */ '../common/containers/TermsPrivacy'));
const Error = lazy(() => import(/* webpackChunkName: "SITE_ERR" */ './error'));

const SiteRoute = () => {
  return (
    <Switch>
      <Route path={`/home`} component={Home} />
      <Route path={`/collections/:urlPath`} component={CollectionPage} />
      <Route path={`/search`} component={SearchPage} />
      <Route path={`/qrscan`} component={QRScan} />
      <Route path={`/auth`} component={Auth} />
      <Route path={`/ordering/location`} component={Location} />
      <Route path={`/error/:type`} component={Error} />
      <Route path={`/terms-of-use`} render={props => <AsyncTermsPrivacy {...props} pageName="terms" />} />
      <Route path={`/privacy-policy`} render={props => <AsyncTermsPrivacy {...props} pageName="privacy" />} />
      <ProtectedRoute path={`/account`}>
        <Account />
      </ProtectedRoute>
      <Route path={ROUTER_PATHS.ORDER_HISTORY} component={OrderHistory} />
      <Redirect from={`/`} to={`/home`} />
      <Route component={NotFound} />
    </Switch>
  );
};
SiteRoute.displayName = 'SiteRoute';

export default withRouter(SiteRoute);
