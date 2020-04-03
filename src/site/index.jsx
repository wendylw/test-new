import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import store from './redux/store';
import SiteApp from './containers/App';
import './Common.scss';
import DocumentFavicon from '../components/DocumentFavicon';
import DocumentHeadInfo from '../components/DocumentHeadInfo';
import favicon from '../images/favicon.ico';

class Site extends Component {
  render() {
    const { t } = this.props;

    return (
      <Provider store={store}>
        <SiteApp />
        <DocumentFavicon icon={favicon} />
        <DocumentHeadInfo
          title={t('MvpDocumentTitle')}
          description={t('MvpDocumentDescription')}
          keywords={t('MvpDocumentKeywords')}
        />
      </Provider>
    );
  }
}

export default withRouter(withTranslation()(Site));
