import React, { Component } from 'react';
import './App.scss';
import { compose } from 'react-apollo';
import withOnlineStoreInfo from './libs/withOnlineStoreInfo';
import Main from './views/Main';

class App extends Component {
  render() {
    const { error } = this.props;

    if (error) {
      console.error(error);
      return (
        <div>Fail to get store info, refresh page after 30 seconds.</div>
      );
    }

    return (
      <div className="app">
        <Main />
      </div>
    );
  }
}

export default compose(withOnlineStoreInfo({
  props: ({ gqlOnlineStoreInfo }) => {
    const { error } = gqlOnlineStoreInfo;
    return { error };
  },
}))(App);
