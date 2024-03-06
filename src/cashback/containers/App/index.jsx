import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {
  actions as appActionCreators,
  getUserCountry,
  getError,
  getLoginBannerPrompt,
  getIsUserLogin,
  getIsLoginRequestStatusPending,
  getOnlineStoreInfoFavicon,
  getIsLoginModalShown,
  getIsClaimCashbackPage,
  getIsSeamlessLoyaltyPage,
  getIsHomePage,
  getLoginAlipayMiniProgramRequestError,
} from '../../redux/modules/app';
import { getPageError } from '../../../redux/modules/entities/error';
import Constants from '../../../utils/constants';
import { isWebview } from '../../../common/utils';
import { isAlipayMiniProgram } from '../../../common/utils/alipay-miniprogram-client';
import faviconImage from '../../../images/favicon.ico';
import '../../../Common.scss';
import './Loyalty.scss';
import Routes from '../Routes';
import ErrorToast from '../../../components/ErrorToast';
import Message from '../../components/Message';
import Login from '../../components/Login';
import { confirm } from '../../../common/utils/feedback';
import DocumentFavicon from '../../../components/DocumentFavicon';
import logger from '../../../utils/monitoring/logger';
import Clevertap from '../../../utils/clevertap';

class App extends Component {
  async componentDidMount() {
    const { t, appActions, userCountry, isClaimCashbackPage, isSeamlessLoyaltyPage } = this.props;

    this.visitErrorPage();

    try {
      // 2. login
      // TNGD code is executed at the very beginning.
      // Because the MP and Beep accounts are not synchronized,
      // it is impossible to determine that the accounts are the same
      if (isAlipayMiniProgram() && !(isClaimCashbackPage || isSeamlessLoyaltyPage || isHomePage)) {
        // the user information of the 3rd MiniProgram may be different, so synchronize the data of the consumer once
        await appActions.loginByAlipayMiniProgram();

        const { loginAlipayMiniProgramRequestError } = this.props;

        // TNGD & GCash code is executed at the very beginning.
        // Because the MP and Beep accounts are not synchronized,
        // it is impossible to determine that the accounts are the same
        // https://opendocs.alipay.com/support/01rb4b?ant_source=opendoc_recommend
        if (loginAlipayMiniProgramRequestError) {
          confirm(t('UnexpectedErrorOccurred'), {
            closeByBackButton: false,
            closeByBackDrop: false,
            cancelButtonContent: t('Cancel'),
            confirmButtonContent: t('TryAgain'),
            onSelection: async confirmStatus => {
              if (confirmStatus) {
                // try again
                Clevertap.pushEvent('Loyalty Page (Login Error Pop-up) - Click Try Again', {
                  country: userCountry,
                });
                await appActions.loginByAlipayMiniProgram();
              } else {
                // cancel
                if (window.my.exitMiniProgram) {
                  window.my.exitMiniProgram();
                }
                Clevertap.pushEvent('Loyalty Page (Login Error Pop-up) - Click Cancel', {
                  country: userCountry,
                });
              }
            },
          });
        }
      }

      await appActions.loadConsumerLoginStatus();

      const { isUserLogin } = this.props;

      if (isWebview() && !(isClaimCashbackPage || isSeamlessLoyaltyPage || isHomePage)) {
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
    const { appActions, pageError, isUserLogin: currIsUserLogin } = this.props;
    const { pageError: prevPageError, isUserLogin: prevIsUserLogin } = prevProps;
    const { code } = prevPageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    if (currIsUserLogin && currIsUserLogin !== prevIsUserLogin) {
      appActions.hideLoginModal();
    }
  };

  async componentWillUnmount() {
    const { appActions } = this.props;

    // The reset here is because BeepApp or TNG MP has a login data cache
    // to ensure the accuracy of data logged in with different accounts.
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
    const {
      t,
      error,
      loginBannerPrompt,
      onlineStoreInfoFavicon,
      isLoginModalShown,
      appActions,
      isClaimCashbackPage,
    } = this.props;
    const { message } = error || {};

    return (
      <main id="beep-app-container" className="loyalty fixed-wrapper__main fixed-wrapper">
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
        {isLoginModalShown && !isWebview() && !isAlipayMiniProgram() ? (
          <Login
            className="aside fixed-wrapper"
            title={isClaimCashbackPage ? t('CashbackLoginText') : loginBannerPrompt || t('LoginBannerPrompt')}
          />
        ) : null}
        <Routes />
        <DocumentFavicon icon={onlineStoreInfoFavicon || faviconImage} />
      </main>
    );
  }
}

App.displayName = 'CashbackApp';

App.propTypes = {
  userCountry: PropTypes.string,
  loginBannerPrompt: PropTypes.string,
  isUserLogin: PropTypes.bool,
  isClaimCashbackPage: PropTypes.bool,
  isSeamlessLoyaltyPage: PropTypes.bool,
  isHomePage: PropTypes.bool,
  onlineStoreInfoFavicon: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  pageError: PropTypes.shape({
    code: PropTypes.number,
  }),
  isLoginModalShown: PropTypes.bool,
  loginAlipayMiniProgramRequestError: PropTypes.object || PropTypes.string,
  appActions: PropTypes.shape({
    loadConsumerLoginStatus: PropTypes.func,
    resetConsumerLoginStatus: PropTypes.func,
    resetConsumerCustomerInfo: PropTypes.func,
    fetchOnlineStoreInfo: PropTypes.func,
    fetchCashbackBusiness: PropTypes.func,
    loginApp: PropTypes.func,
    clearError: PropTypes.func,
    loginByAlipayMiniProgram: PropTypes.func,
    syncLoginFromBeepApp: PropTypes.func,
    loginByBeepApp: PropTypes.func,
    showLoginModal: PropTypes.func,
    hideLoginModal: PropTypes.func,
  }),
};

App.defaultProps = {
  userCountry: null,
  loginBannerPrompt: null,
  isUserLogin: false,
  isClaimCashbackPage: false,
  isSeamlessLoyaltyPage: false,
  isHomePage: false,
  onlineStoreInfoFavicon: '',
  error: {},
  pageError: {},
  isLoginModalShown: false,
  loginAlipayMiniProgramRequestError: null,
  appActions: {},
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      loginBannerPrompt: getLoginBannerPrompt(state),
      isLoginRequestStatusPending: getIsLoginRequestStatusPending(state),
      isUserLogin: getIsUserLogin(state),
      isClaimCashbackPage: getIsClaimCashbackPage(state),
      isSeamlessLoyaltyPage: getIsSeamlessLoyaltyPage(state),
      isHomePage: getIsHomePage(state),
      isLoginModalShown: getIsLoginModalShown(state),
      onlineStoreInfoFavicon: getOnlineStoreInfoFavicon(state),
      error: getError(state),
      pageError: getPageError(state),
      loginAlipayMiniProgramRequestError: getLoginAlipayMiniProgramRequestError(state),
      userCountry: getUserCountry(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
