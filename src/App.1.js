import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import { compose, Query } from 'react-apollo';
import Routes from './Routes';
import config from './config';
import Constants from './Constants';
import withResizeWindowBlocker from './libs/withResizeWindowBlocker';
import apiGql from './apiGql';

class App extends Component {
  state = {
    sessionReady: false,
  };

  async componentDidMount() {
    await fetch(`${config.backendBaseUrl}${Constants.BACKEND_PING_PATH}`);
    this.setState({ sessionReady: true }, () => this.check());
  }

  check() {
    const { history } = this.props;

    if (!config.storeId || !config.table) {
      history.replace({
        pathname: Constants.ROUTER_PATHS.ERROR,
        state: {
          message: 'Invalid URL, please scan QR code to entry this page.',
        },
      });
      return;
    }
  }

  tryPeopleCount(response) {
    const { history } = this.props;
    const { onlineStoreInfo } = response;

    // TODO: remove this default value when API dev is completed.
    const { isPeopleCountRequired = true } = onlineStoreInfo;

    // TODO: remove false and fix payment callback redirect issue.
    if (false && isPeopleCountRequired && !config.peopleCount) {
      if (history.location.pathname.indexOf('/modal/people-count') === -1) {
        const peopleCountModalPath = `${history.location.pathname}/modal/people-count`;
        history.push(peopleCountModalPath);
      }
    }
  }

  renderError(error) {

    return null;
  }

  render() {
    const { history } = this.props;

    return (
      <Query
        query={apiGql.GET_ONLINE_STORE_INFO}
        variables={{ business: config.business }}
        onCompleted={this.tryPeopleCount.bind(this)}
        onError={() => {
          history.replace({
            pathname: Constants.ROUTER_PATHS.ERROR,
            state: { message: 'Account name is not found.' },
          });
        }}
      >
        {() => {
          return (
            <main className="table-ordering">
              <Routes />
            </main>
          )
        }}
      </Query>
    );
  }
}

export default compose(
  withResizeWindowBlocker,
  withRouter,
)(App);
