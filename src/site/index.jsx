import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import store from './redux/store';
import Routes from './Routes';
import SiteFakeHeader from './common/components/SiteFakeHeader';
import SiteFooter from './common/components/SiteFooter';
import './Common.scss';

class Site extends Component {
  render() {
    return (
      <Provider store={store}>
        <SiteFakeHeader />
        <Routes />
        <SiteFooter />
      </Provider>
    );
  }
}

export default withRouter(Site);
