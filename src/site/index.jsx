import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import store from './redux/store';
import SiteApp from './containers/App';
import './Common.scss';
import DocumentFavicon from '../components/DocumentFavicon';
import favicon from '../images/favicon.ico';

class Site extends Component {
  render() {
    return (
      <Provider store={store}>
        <SiteApp />
        <DocumentFavicon icon={favicon} />
      </Provider>
    );
  }
}

export default withRouter(Site);
