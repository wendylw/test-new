import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {
  actions as appActionCreators,
  getError,
  getIsUserLogin,
  getIsAppLogin,
  getIsUserExpired,
  getOnlineStoreInfoFavicon,
  getIsDisplayLoginBanner,
  getIsLoginRequestModalShown,
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

      if ((!isAppLogin && isWebview()) || (!isUserLogin && isTNGMiniProgram())) {
        await appActions.showRequestLoginModal();
      }

      if (isAppLogin && isWebview()) {
        await appActions.loginByBeepApp();
      }

      if (isUserLogin && isTNGMiniProgram()) {
        await appActions.loginByTngMiniProgram();
      }
    } catch (error) {
      logger.error('Cashback_App_InitFailed', { message: error?.message });
    }
  }

  componentDidUpdate = async prevProps => {
    const { appActions, pageError, isUserLogin, userConsumerId, isUserExpired } = this.props;
    const { code } = prevProps.pageError || {};
    const isCurrentLoadCustomerInfoEnabled = userConsumerId && isUserLogin;
    const isPrevLoadCustomerInfoEnabled = prevProps.userConsumerId && prevProps.isUserLogin;

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    // token过期重新发postMessage
    if (isUserExpired && prevProps.isUserExpired !== isUserExpired && isWebview()) {
      await appActions.loginByBeepApp();
    }

    if (isCurrentLoadCustomerInfoEnabled && !isPrevLoadCustomerInfoEnabled) {
      appActions.loadConsumerCustomerInfo({ consumerId: userConsumerId });
    }
  };

  handleRequestLoginClick = async () => {
    const { appActions } = this.props;

    if (isWebview()) {
      await appActions.loginByBeepApp();
      await appActions.loadBeepAppLoginStatus();
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
    const { t, error, onlineStoreInfoFavicon, isDisplayLoginBanner, isLoginRequestModalShown, appActions } = this.props;
    const { message } = error || {};

    return (
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
  userConsumerId: PropTypes.string,
  isAppLogin: PropTypes.bool,
  isUserExpired: PropTypes.bool,
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
    loadBeepAppLoginStatus: PropTypes.func,
    loadConsumerCustomerInfo: PropTypes.func,
    loadOnlineStoreInfo: PropTypes.func,
    loadCashbackBusiness: PropTypes.func,
    loginApp: PropTypes.func,
    clearError: PropTypes.func,
    loginByTngMiniProgram: PropTypes.func,
    loginByBeepApp: PropTypes.func,
    showRequestLoginModal: PropTypes.func,
    hideRequestLoginModal: PropTypes.func,
  }),
};

App.defaultProps = {
  isUserLogin: false,
  userConsumerId: null,
  isAppLogin: false,
  isUserExpired: false,
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
      isUserLogin: getIsUserLogin(state),
      userConsumerId: getIsUserLogin(state),
      isAppLogin: getIsAppLogin(state),
      isUserExpired: getIsUserExpired(state),
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
