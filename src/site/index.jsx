import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import store from './redux/store';
import SiteApp from './containers/App';
import './Common.scss';
import DocumentFavicon from '../components/DocumentFavicon';
import DocumentTitle from '../components/DocumentTitle';
import favicon from '../images/favicon.ico';

class Site extends Component {
  render() {
    return (
      <Provider store={store}>
        <SiteApp />
        <DocumentFavicon icon={favicon} />
        <DocumentTitle icon={favicon} title={'Beep | Food Delivery & Takeaway | Order Food Online Now'} />
      </Provider>
    );
  }
}

export default withRouter(withTranslation()(Site));
