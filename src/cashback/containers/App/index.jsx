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
  getIsLoginRequestStatusPending,
  getOnlineStoreInfoFavicon,
  getIsLoginModalShown,
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
import logger from '../../../utils/monitoring/logger';

class App extends Component {
  async componentDidMount() {
    const { appActions } = this.props;

    this.visitErrorPage();

    try {
      // TNGD code is executed at the very beginning.
      // Because the MP and Beep accounts are not synchronized,
      // it is impossible to determine that the accounts are the same
      if (isTNGMiniProgram()) {
        // the user information of the 3rd MiniProgram may be different, so synchronize the data of the consumer once
        await appActions.loginByTngMiniProgram();

        return;
      }

      const initRequests = [
        appActions.loadConsumerLoginStatus(),
        appActions.fetchOnlineStoreInfo(),
        appActions.fetchCashbackBusiness(),
      ];

      await Promise.all(initRequests);

      const { isUserLogin, userConsumerId } = this.props;

      if (userConsumerId) {
        await appActions.loadConsumerCustomerInfo();
      }

      if (isWebview()) {
        await appActions.syncLoginFromBeepApp();

        return;
      }

      if (!isUserLogin) {
        appActions.showLoginModal();
      }
    } catch (error) {
      logger.error('Cashback_App_InitFailed', { message: error?.message });
    }
  }

  componentDidUpdate = async prevProps => {
    const { appActions, pageError, isUserLogin: currIsUserLogin, userConsumerId: currUserConsumerId } = this.props;
    const { pageError: prevPageError, isUserLogin: prevIsUserLogin, userConsumerId: prevUserConsumerId } = prevProps;
    const { code } = prevPageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    // currUserConsumerId !== prevUserConsumerId instead of !prevUserConsumerId .
    // The 3rd MiniProgram cached the previous consumerId, so the consumerId is not the correct account
    if (currUserConsumerId && currUserConsumerId !== prevUserConsumerId) {
      appActions.loadConsumerCustomerInfo();
    }

    if (currIsUserLogin && currIsUserLogin !== prevIsUserLogin) {
      appActions.hideLoginModal();
    }
  };

  async componentWillUnmount() {
    const { appActions } = this.props;

    await appActions.resetConsumerLoginStatus();
    await appActions.resetConsumerCustomerInfo();
  }

  // eslint-disable-next-line consistent-return
  visitErrorPage() {
    const { pageError } = this.props;

    if (!pageError || !pageError.code) {
      return;
    }

    // eslint-disable-next-line consistent-return, no-return-assign
    return (window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ERROR}`);
  }

  render() {
    const { t, error, loginBannerPrompt, onlineStoreInfoFavicon, isLoginModalShown, appActions } = this.props;
    const { message } = error || {};

    return (
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
        {isLoginModalShown && !isWebview() && !isTNGMiniProgram() ? (
          <Login className="aside fixed-wrapper" title={loginBannerPrompt || t('LoginBannerPrompt')} />
        ) : null}
        <Routes />
        <DocumentFavicon icon={onlineStoreInfoFavicon || faviconImage} />
      </main>
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
  isLoginModalShown: PropTypes.bool,
  appActions: PropTypes.shape({
    loadConsumerLoginStatus: PropTypes.func,
    resetConsumerLoginStatus: PropTypes.func,
    loadConsumerCustomerInfo: PropTypes.func,
    resetConsumerCustomerInfo: PropTypes.func,
    fetchOnlineStoreInfo: PropTypes.func,
    fetchCashbackBusiness: PropTypes.func,
    loginApp: PropTypes.func,
    clearError: PropTypes.func,
    loginByTngMiniProgram: PropTypes.func,
    syncLoginFromBeepApp: PropTypes.func,
    loginByBeepApp: PropTypes.func,
    showLoginModal: PropTypes.func,
    hideLoginModal: PropTypes.func,
  }),
};

App.defaultProps = {
  loginBannerPrompt: null,
  isUserLogin: false,
  userConsumerId: null,
  onlineStoreInfoFavicon: '',
  error: {},
  pageError: {},
  isLoginModalShown: false,
  appActions: {},
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      loginBannerPrompt: getLoginBannerPrompt(state),
      isLoginRequestStatusPending: getIsLoginRequestStatusPending(state),
      isUserLogin: getIsUserLogin(state),
      userConsumerId: getUserConsumerId(state),
      isLoginModalShown: getIsLoginModalShown(state),
      onlineStoreInfoFavicon: getOnlineStoreInfoFavicon(state),
      error: getError(state),
      pageError: getPageError(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
