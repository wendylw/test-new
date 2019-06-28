import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import './App.scss';
import store from './store';
import Constants from '../Constants';

const loading = () => <div className="loader theme page-loader"></div>;

// Containers
const PageClaim = React.lazy(() => import('./views/PageClaim'));
const PageHome = React.lazy(() => import('./views/PageLoyalty'));
const ErrorPage = React.lazy(() => import('./views/components/Error'));

// Pages

function App() {
  return (
    <Provider store={store}>
      <React.Suspense fallback={loading()}>
        <Switch>
          <Redirect exact from={Constants.ROUTER_PATHS.INDEX} to={Constants.ROUTER_PATHS.CASHBACK_HOME} />
          <Route exact path={Constants.ROUTER_PATHS.CASHBACK_CLAIM} render={props => <PageClaim {...props} />} />
          <Route exact path={Constants.ROUTER_PATHS.CASHBACK_HOME} name="Loyalty" render={props => <PageHome {...props} />} />
          <Route exact path={Constants.ROUTER_PATHS.CASHBACK_ERROR} name="Error" render={props => <ErrorPage {...props} />} />
        </Switch>
      </React.Suspense>
    </Provider>
  );
}

export default App;
