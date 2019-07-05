import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Query } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';
import Constants from '../Constants';

import DocumentFavicon from '../components/DocumentFavicon';

const loading = () => <div className="loader theme page-loader"></div>;

// Containers
const PageClaim = React.lazy(() => import('./views/PageClaim'));
const PageHome = React.lazy(() => import('./views/PageLoyalty'));
const ErrorPage = React.lazy(() => import('./views/components/Error'));

// Pages
function Routes() {
  return (
    <Query
      query={apiGql.GET_ONLINE_STORE_INFO}
      variables={{ business: config.business }}
      onCompleted={(data) => {
        const { onlineStoreInfo } = data;
        this.props.setOnlineStoreInfo(onlineStoreInfo);
      }}
    >
      {({ data }) => {
        const { onlineStoreInfo = {} } = data;

        return (
          <React.Suspense fallback={loading()}>
            <DocumentFavicon icon={onlineStoreInfo.icon} />
            <Switch>
              <Redirect exact from={Constants.ROUTER_PATHS.INDEX} to={Constants.ROUTER_PATHS.CASHBACK_HOME} />
              <Route
                exact
                path={Constants.ROUTER_PATHS.CASHBACK_CLAIM}
                render={props => <PageClaim onlineStoreInfo={onlineStoreInfo} {...props} />}
              />
              <Route
                exact
                path={Constants.ROUTER_PATHS.CASHBACK_HOME}
                name="Loyalty"
                render={props => <PageHome onlineStoreInfo={onlineStoreInfo} {...props} />}
              />
              <Route exact path={Constants.ROUTER_PATHS.CASHBACK_ERROR} name="Error" render={props => <ErrorPage {...props} />} />
            </Switch>
          </React.Suspense>
        );
      }}
    </Query>
  );
}

export default Routes;
