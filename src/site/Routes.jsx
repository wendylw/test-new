import React, { lazy } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import Home from './home';
import Account from './account';
import QRScan from './qrscan';
import Error from './error';
import NotFound from './components/NotFound';
import Auth from './auth';
import ProtectedRoute from './components/ProtectedRoute';
import Location from './ordering/containers/Location';
import CollectionPage from './collections/CollectionPage';
import SearchPage from './search/SearchPage';
const AsyncTermsPrivacy = lazy(() => import('../containers/TermsPrivacy'));

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
      <Redirect from={`/`} to={`/home`} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default withRouter(SiteRoute);
