import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import {
  actions as appActionCreators,
  getOnlineStoreInfoFavicon,
  getShowPageLoader,
  getPageErrorCode,
  getBusinessInfo,
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
    const { appActions } = this.props;

    appActions.loadAppBaseData();
  }

  componentDidUpdate() {
    const { businessesInfo } = this.props;
    const { country, isQROrderingEnabled } = businessesInfo || {};

    if (country && !isQROrderingEnabled) {
      window.location.href = window.location.origin;
    }
  }

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

  pageReload = () => {
    window.location.reload();
  };

  gotoHomePage = () => {
    window.location.href = config.beepitComUrl;
  };

  render() {
    const { showPageLoader, pageErrorCode, favicon } = this.props;

    if (showPageLoader) {
      return <PageLoader />;
    }

    if (pageErrorCode) {
      const props = this.getPageErrorProps();
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <PageError {...props} />;
    }

    return (
      <main className="voucher fixed-wrapper fixed-wrapper__main">
        <Routes />
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}

App.displayName = 'VoucherApp';

App.propTypes = {
  appActions: PropTypes.shape({
    loadAppBaseData: PropTypes.func,
  }),
  businessesInfo: PropTypes.shape({
    country: PropTypes.string,
    isQROrderingEnabled: PropTypes.bool,
  }),
  favicon: PropTypes.string,
  pageErrorCode: PropTypes.string,
  showPageLoader: PropTypes.bool,
};

App.defaultProps = {
  appActions: {
    loadAppBaseData: () => {},
  },
  businessesInfo: {
    country: '',
    isQROrderingEnabled: false,
  },
  favicon: '',
  pageErrorCode: null,
  showPageLoader: false,
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      favicon: getOnlineStoreInfoFavicon(state),
      showPageLoader: getShowPageLoader(state),
      pageErrorCode: getPageErrorCode(state),
      businessesInfo: getBusinessInfo(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
