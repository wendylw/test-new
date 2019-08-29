import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Query } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';
import { setOnlineStoreInfo, getBusiness } from './actions';

import Constants from '../Constants';

import DocumentFavicon from '../components/DocumentFavicon';

const loading = () => <div className="loader theme page-loader"></div>;

// Containers
const PageClaim = React.lazy(() => import('./views/PageClaim'));
const PageHome = React.lazy(() => import('./views/PageLoyalty'));
const Error = React.lazy(() => import('../components/Error'));

// Pages
class Routes extends React.Component {
  state = {}

  componentWillMount() {
    const { getBusiness } = this.props;

    getBusiness(config.storeId);
  }

  render() {
    const { setOnlineStoreInfo } = this.props;

    return (
      <Query
        query={apiGql.GET_ONLINE_STORE_INFO}
        variables={{ business: config.business }}
        onCompleted={(data) => {
          const { onlineStoreInfo } = data;

          setOnlineStoreInfo(onlineStoreInfo);
        }}
      >
        {({ data }) => {
          const { onlineStoreInfo } = data;
          const { favicon } = onlineStoreInfo || {};

          return (
            <React.Suspense fallback={loading()}>
              <DocumentFavicon icon={favicon || Constants.DEFAULT_FAVICON} />
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
                <Route exact path={Constants.ROUTER_PATHS.CASHBACK_ERROR} name="Error" render={props => <Error {...props} />} />
              </Switch>
            </React.Suspense>
          );
        }}
      </Query>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => bindActionCreators({
  getBusiness,
  setOnlineStoreInfo,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
