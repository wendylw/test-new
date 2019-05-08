import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import { compose, Query } from 'react-apollo';
import Routes from './Routes';
import config from './config';
import Constants from './Constants';
import withResizeWindowBlocker from './libs/withResizeWindowBlocker';
import apiGql from './apiGql';
import { clientCoreApi } from './apiClient';

class App extends Component {
  state = {
    sessionReady: false,
  };

  async componentWillMount() {
    await fetch(`${Constants.BACKEND_PING_PATH}`);
    this.setState({ sessionReady: true }, () => this.check());
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.sessionReady) {
      return false;
    }

    return true;
  }

  check() {
    if (!config.storeId || !config.table) {
      this.goToError(); // use default message
      return;
    }
  }

  goToError(message) {
    const { history } = this.props;

    history.replace({
      pathname: Constants.ROUTER_PATHS.ERROR,
      state: {
        message,
      },
    });
  }

  tryPeopleCount(response) {
    const { history } = this.props;
    const { business } = response;

    const { enablePax, subscriptionStatus, stores } = business;

    if (subscriptionStatus === 'Expired') {
      this.goToError('Account is expired.');
      return;
    }

    if (!Array.isArray(stores) || !stores.length) {
      this.goToError('Store is not found.');
      return;
    }

    // Everytime reload /home page, will effects a Pax selector.
    if (enablePax && history.location.pathname === Constants.ROUTER_PATHS.HOME) {
      if (history.location.pathname.indexOf('/modal/people-count') === -1) {
        const peopleCountModalPath = `${history.location.pathname}/modal/people-count`;
        history.push(peopleCountModalPath);
      }
    }
  }

  render() {
    const { history } = this.props;
    const { sessionReady } = this.state;

    if (!sessionReady) {
      return null;
    }

    return (
      <Query
        query={apiGql.GET_CORE_BUSINESS}
        client={clientCoreApi}
        variables={{ business: config.business, storeId: config.storeId }}
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
