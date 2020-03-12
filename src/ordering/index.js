import React, { Component } from 'react';
import { Provider } from 'react-redux';
import App from './containers/App';
import store from './redux/store';
import ErrorPage from '../containers/ErrorPage';

class index extends Component {
  render() {
    return <Provider store={store}>{process.env.REACT_APP_BLOCK_ORDERING === true ? <ErrorPage /> : <App />}</Provider>;
  }
}

export default index;
