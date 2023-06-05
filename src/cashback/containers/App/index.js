import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {
  actions as appActionCreators,
  getError,
  getLoginBannerPrompt,
  getIsUserLogin,
  getOnlineStoreInfoFavicon,
  getIsDisplayLoginBanner,
  getIsLoginRequestModalShown,
  getUserConsumerId,
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

      await Promise.all(initRequests);

      if (isWebview()) {
        await appActions.syncLoginFromNative();
      }

      if (isTNGMiniProgram()) {
        await appActions.loginByTngMiniProgram();
      }
    } catch (error) {
      logger.error('Cashback_App_InitFailed', { message: error?.message });
    }
  }

  componentDidUpdate = async prevProps => {
    const { appActions, pageError, isUserLogin, userConsumerId } = this.props;
    const { code } = prevProps.pageError || {};
    const isCurrentLoadCustomerInfoEnabled = userConsumerId && isUserLogin;
    const isPrevLoadCustomerInfoEnabled = prevProps.userConsumerId && prevProps.isUserLogin;

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    if (isCurrentLoadCustomerInfoEnabled && !isPrevLoadCustomerInfoEnabled) {
      appActions.loadConsumerCustomerInfo({ consumerId: userConsumerId });
    }
  };

  handleRequestLoginClick = async () => {
    const { appActions } = this.props;

    if (isWebview()) {
      await appActions.loginByBeepApp();
    } else if (isTNGMiniProgram()) {
      await appActions.loginByTngMiniProgram();
    }

    const { isUserLogin } = this.props;

    if (isUserLogin) {
      appActions.hideRequestLoginModal();
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
      loginBannerPrompt,
      onlineStoreInfoFavicon,
      isDisplayLoginBanner,
      isLoginRequestModalShown,
      appActions,
    } = this.props;
    const { message } = error || {};

    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <>
        {isWebview() && <NativeHeader />}
        {isLoginRequestModalShown ? (
          <RequestLogin onClick={this.handleRequestLoginClick} />
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
            {isDisplayLoginBanner ? (
              <Login className="aside fixed-wrapper" title={loginBannerPrompt || t('LoginBannerPrompt')} />
            ) : null}
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
  loginBannerPrompt: PropTypes.string,
  isUserLogin: PropTypes.bool,
  userConsumerId: PropTypes.string,
  onlineStoreInfoFavicon: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  pageError: PropTypes.shape({
    code: PropTypes.number,
  }),
  isDisplayLoginBanner: PropTypes.bool,
  isLoginRequestModalShown: PropTypes.bool,
  appActions: PropTypes.shape({
    loadConsumerLoginStatus: PropTypes.func,
    loadConsumerCustomerInfo: PropTypes.func,
    loadOnlineStoreInfo: PropTypes.func,
    loadCashbackBusiness: PropTypes.func,
    loginApp: PropTypes.func,
    clearError: PropTypes.func,
    loginByTngMiniProgram: PropTypes.func,
    syncLoginFromNative: PropTypes.func,
    loginByBeepApp: PropTypes.func,
    showRequestLoginModal: PropTypes.func,
    hideRequestLoginModal: PropTypes.func,
  }),
};

App.defaultProps = {
  loginBannerPrompt: null,
  isUserLogin: false,
  userConsumerId: null,
  onlineStoreInfoFavicon: '',
  error: {},
  pageError: {},
  isDisplayLoginBanner: false,
  isLoginRequestModalShown: false,
  appActions: {},
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      loginBannerPrompt: getLoginBannerPrompt(state),
      isUserLogin: getIsUserLogin(state),
      userConsumerId: getUserConsumerId(state),
      isDisplayLoginBanner: getIsDisplayLoginBanner(state),
      isLoginRequestModalShown: getIsLoginRequestModalShown(state),
      onlineStoreInfoFavicon: getOnlineStoreInfoFavicon(state),
      error: getError(state),
      pageError: getPageError(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
