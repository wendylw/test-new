import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import { compose } from 'react-apollo';
import Routes from './Routes';
import config from './config';
import Constants from './Constants';
import withResizeWindowBlocker from './libs/withResizeWindowBlocker';
import withCoreApiBusiness from './libs/withCoreApiBusiness';
import withOnlineStoreInfo from './libs/withOnlineStoreInfo';
import DocumentFavicon from './components/DocumentFavicon';
import Manifest from './views/components/Manifest';

class App extends Component {
  state = {
    sessionReady: false,
  };

  async componentWillMount() {
    await fetch(`${Constants.BACKEND_PING_PATH}`, {
      credentials: 'same-origin',
    });
    this.setState({ sessionReady: true }, () => this.check());
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.sessionReady) {
      return false;
    }

    return true;
  }

  check() {
    if (!config.storeId) {
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
    const { gqlOnlineStoreInfo } = this.props;

    if (gqlOnlineStoreInfo.loading) {
      return null;
    }

    const { sessionReady } = this.state;

    if (!sessionReady) {
      return null;
    }

<<<<<<< HEAD
    const { onlineStoreInfo = {} } = gqlOnlineStoreInfo;
=======
    const { onlineStoreInfo } = gqlOnlineStoreInfo;
>>>>>>> origin/master

    return (
      <main className="table-ordering">
        <Routes />
        <DocumentFavicon icon={onlineStoreInfo.favicon} />
        <Manifest />
      </main>
    );
  }
}

export default compose(
  withResizeWindowBlocker,
  withRouter,
  withCoreApiBusiness,
  withOnlineStoreInfo(),
)(App);
