import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import { compose } from 'react-apollo';
import Routes from './Routes';
import config from './config';
import Constants from './Constants';
import withResizeWindowBlocker from './libs/withResizeWindowBlocker';
import withCoreApiBusiness from './libs/withCoreApiBusiness';

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

  render() {
    const { sessionReady } = this.state;

    if (!sessionReady) {
      return null;
    }

    return (
      <main className="table-ordering">
        <Routes />
      </main>
    );
  }
}

export default compose(
  withResizeWindowBlocker,
  withRouter,
  withCoreApiBusiness,
)(App);
