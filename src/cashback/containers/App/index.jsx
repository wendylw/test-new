import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {
  actions as appActionCreators,
  getMessageInfo,
  getError,
  getIsUserLogin,
  getIsAppLogin,
  getIsUserExpired,
  getOnlineStoreInfoFavicon,
  getIsDisplayLoginBanner,
  getIsDisplayRequestLoginPage,
} from '../../redux/modules/app';
import { getPageError } from '../../../redux/modules/entities/error';
import Constants from '../../../utils/constants';
import { isTNGMiniProgram, isWebview } from '../../../common/utils';
import faviconImage from '../../../images/favicon.ico';
import '../../../Common.scss';
import './Loyalty.scss';
import Routes from '../Routes';
import ErrorToast from '../../../components/ErrorToast';
import Message from '../../components/Message';
import Login from '../../components/Login';
import DocumentFavicon from '../../../components/DocumentFavicon';
import RequestLogin from './components/RequestLogin';
import NativeHeader from '../../../components/NativeHeader';
import logger from '../../../utils/monitoring/logger';

class App extends Component {
  async componentDidMount() {
    const { appActions } = this.props;

    this.visitErrorPage();

    try {
      const initRequests = [
        appActions.loadConsumerLoginStatus(),
        appActions.loadOnlineStoreInfo(),
        appActions.loadCashbackBusiness(),
      ];

      if (isWebview()) {
        initRequests.push(appActions.loadBeepAppLoginStatus());
      }

      await Promise.all(initRequests);

      const { isUserLogin, isAppLogin } = this.props;

      if (isUserLogin && isTNGMiniProgram()) {
        await appActions.loginByTngMiniProgram();
      }

      if (isAppLogin && isWebview()) {
        await appActions.loginByBeepApp();
      }
    } catch (error) {
      logger.error('Cashback_App_InitFailed', { message: error?.message });
    }
  }

  componentDidUpdate = async prevProps => {
    const { appActions, pageError, isUserLogin, isUserExpired } = this.props;
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    // token过期重新发postMessage
    if (isUserExpired && prevProps.isUserExpired !== isUserExpired && isWebview()) {
      await appActions.loginByBeepApp();
    }

    if (isUserLogin && prevProps.isUserLogin !== isUserLogin) {
      appActions.loadConsumerCustomerInfo();
    }
  };

  handleAppLoginClick = async () => {
    const { appActions } = this.props;

    if (isWebview()) {
      await appActions.loginByBeepApp();
      return;
    }

    if (isTNGMiniProgram()) {
      await appActions.loginByTngMiniProgram();
    }
  };

  // eslint-disable-next-line consistent-return
  visitErrorPage() {
    const { pageError } = this.props;

    if (pageError && pageError.code) {
      // eslint-disable-next-line no-return-assign
      return (window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ERROR}`);
    }
  }

  render() {
    const {
      t,
      error,
      onlineStoreInfoFavicon,
      isDisplayLoginBanner,
      isDisplayRequestLoginPage,
      appActions,
    } = this.props;
    const { message } = error || {};

    return (
      <>
        {isWebview() && <NativeHeader />}
        {isDisplayRequestLoginPage ? (
          <RequestLogin onClick={this.handleAppLoginClick} />
        ) : (
          <main className="loyalty fixed-wrapper__main fixed-wrapper">
            {message ? (
              <ErrorToast
                className="fixed"
                message={message}
                clearError={() => {
                  appActions.clearError();
                }}
              />
            ) : null}
            <Message />
            {isDisplayLoginBanner ? <Login className="aside fixed-wrapper" title={t('LoginBannerPrompt')} /> : null}
            <Routes />
            <DocumentFavicon icon={onlineStoreInfoFavicon || faviconImage} />
          </main>
        )}
      </>
    );
  }
}

App.displayName = 'CashbackApp';

App.propTypes = {
  isUserLogin: PropTypes.bool,
  isAppLogin: PropTypes.bool,
  isUserExpired: PropTypes.bool,
  onlineStoreInfoFavicon: PropTypes.string,
  messageInfo: PropTypes.shape({
    message: PropTypes.string,
  }),
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  pageError: PropTypes.shape({
    code: PropTypes.number,
  }),
  isDisplayLoginBanner: PropTypes.bool,
  isDisplayRequestLoginPage: PropTypes.bool,
  appActions: PropTypes.shape({
    loadConsumerLoginStatus: PropTypes.func,
    loadBeepAppLoginStatus: PropTypes.func,
    loadConsumerCustomerInfo: PropTypes.func,
    loadOnlineStoreInfo: PropTypes.func,
    loadCashbackBusiness: PropTypes.func,
    loginApp: PropTypes.func,
    clearError: PropTypes.func,
    loginByTngMiniProgram: PropTypes.func,
    loginByBeepApp: PropTypes.func,
  }),
};

App.defaultProps = {
  isUserLogin: false,
  isAppLogin: false,
  isUserExpired: false,
  onlineStoreInfoFavicon: '',
  messageInfo: {},
  error: {},
  pageError: {},
  isDisplayLoginBanner: false,
  isDisplayRequestLoginPage: false,
  appActions: {},
};

export default compose(
  withTranslation(['ApiError', 'Cashback']),
  connect(
    state => ({
      isUserLogin: getIsUserLogin(state),
      isAppLogin: getIsAppLogin(state),
      isUserExpired: getIsUserExpired(state),
      isDisplayLoginBanner: getIsDisplayLoginBanner(state),
      isDisplayRequestLoginPage: getIsDisplayRequestLoginPage(state),
      onlineStoreInfoFavicon: getOnlineStoreInfoFavicon(state),
      messageInfo: getMessageInfo(state),
      error: getError(state),
      pageError: getPageError(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
