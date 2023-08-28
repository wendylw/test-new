/* eslint-disable react/jsx-props-no-spreading */
import React, { lazy } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import QRScan from './qrscan';
import Error from './error';
import NotFound from './components/NotFound';
import Location from './ordering/containers/Location';
import CollectionPage from './collections/CollectionPage';
import SearchPage from './search/SearchPage';
import Constants from '../utils/constants';

const { ROUTER_PATHS } = Constants;

const Home = lazy(() => import(/* webpackChunkName: "SITE_HM" */ './home'));
const OrderHistory = lazy(() => import(/* webpackChunkName: "SITE_OH" */ './order-history'));
const AsyncTermsPrivacy = lazy(() => import(/* webpackChunkName: "SITE_TP" */ '../common/containers/TermsPrivacy'));

const SiteRoute = () => (
  <Switch>
    <Route path="/home" component={Home} />
    <Route path="/collections/:urlPath" component={CollectionPage} />
    <Route path="/search" component={SearchPage} />
    <Route path="/qrscan" component={QRScan} />
    <Route path="/error/:type" component={Error} />
    <Route path="/ordering/location" component={Location} />
    <Route path="/terms-of-use" render={props => <AsyncTermsPrivacy {...props} pageName="terms" />} />
    <Route path="/privacy-policy" render={props => <AsyncTermsPrivacy {...props} pageName="privacy" />} />
    <Route path={ROUTER_PATHS.ORDER_HISTORY} component={OrderHistory} />
    <Redirect from="/" to="/home" />
    <Route component={NotFound} />
  </Switch>
);
SiteRoute.displayName = 'SiteRoute';

export default withRouter(SiteRoute);
