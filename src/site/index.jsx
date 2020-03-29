import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import store from './redux/store';
import './Common.scss';
import SiteApp from './containers/App';

class Site extends Component {
  render() {
    return (
      <Provider store={store}>
        <SiteApp />
      </Provider>
    );
  }
}

export default withRouter(Site);
