import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import store from './redux/store';
import './Common.scss';
import SiteApp from './containers/App';
import DocumentFavicon from '../components/DocumentFavicon';
import DocumentHeadInfo from '../components/DocumentHeadInfo';
import favicon from '../images/favicon.ico';
import Utils from '../utils/utils';
import Constants from '../utils/constants';

class Site extends Component {
  constructor(props) {
    super(props);
    if (Utils.getUserAgentInfo().browser.includes('Safari')) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }
  }
  render() {
    const { t, location } = this.props;
    const isOrderHistoryPage = location.pathname === Constants.ROUTER_PATHS.ORDER_HISTORY;

    return (
      <Provider store={store}>
        <SiteApp />
        <DocumentFavicon icon={favicon} />
        <DocumentHeadInfo
          title={isOrderHistoryPage ? t('MyOrderHistory') : t('MvpDocumentTitle')}
          description={t('MvpDocumentDescription')}
          keywords={t('MvpDocumentKeywords')}
        />
      </Provider>
    );
  }
}
Site.displayName = 'Site';

export default withRouter(withTranslation()(Site));
