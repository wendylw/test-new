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
        appActions.fetchOnlineStoreInfo(),
        appActions.fetchCashbackBusiness(),
      ];

      await Promise.all(initRequests);

      const { isUserLogin, userConsumerId } = this.props;

      if (userConsumerId) {
        appActions.loadConsumerCustomerInfo();
      }

      if (isWebview()) {
        await appActions.syncLoginFromBeepApp();

        return;
      }

      if (!isUserLogin) {
        appActions.showLoginModal();
      } else {
        // The user is logged in, the user information of the 3rd MiniProgram may be different, so synchronize the data of the consumer once
        isTNGMiniProgram() && (await appActions.loginByTngMiniProgram());
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

  handleRequestLoginClick = async () => {
    const { appActions } = this.props;

    if (isWebview()) {
      await appActions.loginByBeepApp();
    } else if (isTNGMiniProgram()) {
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
      loginBannerPrompt,
      onlineStoreInfoFavicon,
      isLoginModalShown,
      isLoginRequestStatusPending,
      appActions,
    } = this.props;
    const { message } = error || {};

    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <>
        {isWebview() && <NativeHeader />}
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
          {isLoginModalShown ? (
            isWebview() || isTNGMiniProgram() ? (
              <RequestLogin
                onClick={this.handleRequestLoginClick}
                isLoginRequestStatusPending={isLoginRequestStatusPending}
              />
            ) : (
              <Login className="aside fixed-wrapper" title={loginBannerPrompt || t('LoginBannerPrompt')} />
            )
          ) : null}
          <Routes />
          <DocumentFavicon icon={onlineStoreInfoFavicon || faviconImage} />
        </main>
      </>
    );
  }
}

App.displayName = 'CashbackApp';

App.propTypes = {
  loginBannerPrompt: PropTypes.string,
  isLoginRequestStatusPending: PropTypes.bool,
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
    loadConsumerCustomerInfo: PropTypes.func,
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
  isLoginRequestStatusPending: false,
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
