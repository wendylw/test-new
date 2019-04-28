import React, { Component } from 'react';
import './App.scss';
import { compose } from 'react-apollo';
import withOnlineStoreInfo from './libs/withOnlineStoreInfo';
import Routes from './Routes';
import config from './config';
import Constants from './Constants';

class App extends Component {
  state = {
    sessionReady: false,
  };

  async componentDidMount() {
    await fetch(`${config.backendBaseUrl}${Constants.BACKEND_PING_PATH}`);
    this.setState({ sessionReady: true });
  }

  render() {
    const { error } = this.props;

    if (error) {
      console.error(error);
      return (
        <div>Fail to get store info, refresh page after 30 seconds.</div>
      );
    }

    return (
      <main className="table-ordering">
        {this.state.sessionReady ? <Routes /> : null}
      </main>
    );
  }
}

export default compose(withOnlineStoreInfo({
  props: ({ gqlOnlineStoreInfo }) => {
    const { error } = gqlOnlineStoreInfo;
    return { error };
  },
}))(App);
