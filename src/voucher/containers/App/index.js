import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfoFavicon,
  getShowPageLoader,
  getPageErrorCode,
  PAGE_ERROR_CODE_LIST,
} from '../../redux/modules/app';
import '../../../Common.scss';
import Routes from '../Routes';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';
import PageError from '../../components/PageError';
import PageLoader from '../../components/PageLoader';
import config from '../../../config';

class App extends Component {
  componentDidMount() {
    this.props.appActions.loadAppBaseData();
  }

  pageReload = () => {
    window.location.reload();
  };

  gotoHomePage = () => {
    window.location.href = config.beepitComUrl;
  };

  getPageErrorProps() {
    const { pageErrorCode, t } = this.props;
    switch (pageErrorCode) {
      case PAGE_ERROR_CODE_LIST.BUSINESS_NOT_FOUND:
        return {
          title: `${t('NoBusinessTitle')}!`,
          description: t('NoBusinessDescription'),
          button: {
            text: t('BackToHome'),
            onClick: () => {
              this.gotoHomePage();
            },
          },
        };
      case PAGE_ERROR_CODE_LIST.REQUEST_ERROR:
      default:
        return {
          title: `${t('Sorry')}!`,
          description: t('ConnectionIssue'),
          button: {
            text: t('TryAgain'),
            onClick: () => {
              this.pageReload();
            },
          },
        };
    }
  }

  render() {
    const { showPageLoader, pageErrorCode } = this.props;

    if (showPageLoader) {
      return <PageLoader />;
    }

    if (pageErrorCode) {
      const props = this.getPageErrorProps();
      return <PageError {...props} />;
    }

    return (
      <main className="voucher fixed-wrapper fixed-wrapper__main">
        <Routes />
        <DocumentFavicon icon={this.props.favicon || faviconImage} />
      </main>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      favicon: getOnlineStoreInfoFavicon(state),
      showPageLoader: getShowPageLoader(state),
      pageErrorCode: getPageErrorCode(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
