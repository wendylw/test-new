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
  getUserConsumerId,
  getIsTngAuthorizationError,
} from '../../redux/modules/app';
import { getIsCashbackClaimRequestFulfilled } from '../../redux/modules/claim';
import { getIsConfirmSharingConsumerInfoCompleted } from '../StoreRedemption/redux/selectors';
import { getPageError } from '../../../redux/modules/entities/error';
import { getIsLoadCustomerRequestCompleted } from '../../redux/modules/customer/selectors';
import { loadConsumerCustomerInfo as loadConsumerCustomerInfoThunk } from '../../redux/modules/customer/thunks';
import Constants from '../../../utils/constants';
import { isTNGMiniProgram, isWebview } from '../../../common/utils';
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
import { PATH_NAME_MAPPING } from '../../../common/utils/constants';

class App extends Component {
  async componentDidMount() {
    const { t, appActions, userCountry, loadConsumerCustomerInfo } = this.props;
    const { pathname } = window.location;

    this.visitErrorPage();

    try {
      // 1. fetch online store info
      const initRequests = [appActions.fetchOnlineStoreInfo(), appActions.fetchCashbackBusiness()];

      await Promise.all(initRequests);

      // 2. login
      // TNGD code is executed at the very beginning.
      // Because the MP and Beep accounts are not synchronized,
      // it is impossible to determine that the accounts are the same
      if (isTNGMiniProgram()) {
        // the user information of the 3rd MiniProgram may be different, so synchronize the data of the consumer once
        await appActions.loginByTngMiniProgram();

        const { isTngAuthorizationError } = this.props;

        if (isTngAuthorizationError) {
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
                await appActions.loginByTngMiniProgram();
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

      const {
        isUserLogin,
        userConsumerId,
        isCashbackClaimRequestFulfilled,
        isConfirmSharingConsumerInfoCompleted,
      } = this.props;

      if (isWebview()) {
        await appActions.syncLoginFromBeepApp();

        return;
      }

      if (!isUserLogin) {
        appActions.showLoginModal();
      }

      // TODO: This will be optimized later, this is a temporary modification plan.
      // It is not recommended to introduce page selector in App or app.
      if (userConsumerId) {
        let isLoadCustomerAvailable = true;

        if (pathname.includes(PATH_NAME_MAPPING.CASHBACK_CLAIM)) {
          isLoadCustomerAvailable = isCashbackClaimRequestFulfilled;
        }

        if (pathname.includes(PATH_NAME_MAPPING.STORE_REDEMPTION)) {
          isLoadCustomerAvailable = isConfirmSharingConsumerInfoCompleted;
        }

        if (isLoadCustomerAvailable) {
          await loadConsumerCustomerInfo();
        }
      }
    } catch (error) {
      logger.error('Cashback_App_InitFailed', { message: error?.message });
    }
  }

  componentDidUpdate = async prevProps => {
    const {
      appActions,
      pageError,
      isUserLogin: currIsUserLogin,
      userConsumerId: currUserConsumerId,
      loadConsumerCustomerInfo,
      isLoadCustomerRequestCompleted,
      isCashbackClaimRequestFulfilled: currIsCashbackClaimRequestFulfilled,
      isConfirmSharingConsumerInfoCompleted: currIsConfirmSharingConsumerInfoCompleted,
    } = this.props;
    const {
      pageError: prevPageError,
      isUserLogin: prevIsUserLogin,
      isCashbackClaimRequestFulfilled: prevIsCashbackClaimRequestFulfilled,
      isConfirmSharingConsumerInfoCompleted: prevIsConfirmSharingConsumerInfoCompleted,
    } = prevProps;
    const { code } = prevPageError || {};
    const { pathname } = window.location;

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    // currUserConsumerId !== prevUserConsumerId instead of !prevUserConsumerId .
    // The 3rd MiniProgram cached the previous consumerId, so the consumerId is not the correct account
    if (currIsUserLogin && currUserConsumerId) {
      let isLoadCustomerAvailable = false;

      if (
        pathname.includes(PATH_NAME_MAPPING.CASHBACK_CLAIM) &&
        currIsCashbackClaimRequestFulfilled &&
        currIsCashbackClaimRequestFulfilled !== prevIsCashbackClaimRequestFulfilled
      ) {
        isLoadCustomerAvailable = currIsCashbackClaimRequestFulfilled;
      }

      if (
        pathname.includes(PATH_NAME_MAPPING.STORE_REDEMPTION) &&
        currIsConfirmSharingConsumerInfoCompleted !== prevIsConfirmSharingConsumerInfoCompleted
      ) {
        isLoadCustomerAvailable = currIsConfirmSharingConsumerInfoCompleted;
      }

      if (pathname.includes(PATH_NAME_MAPPING.CASHBACK_BASE) && !isLoadCustomerRequestCompleted) {
        isLoadCustomerAvailable = true;
      }

      if (isLoadCustomerAvailable) {
        await loadConsumerCustomerInfo();
      }
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
  userCountry: PropTypes.string,
  loginBannerPrompt: PropTypes.string,
  isUserLogin: PropTypes.bool,
  isCashbackClaimRequestFulfilled: PropTypes.bool,
  isConfirmSharingConsumerInfoCompleted: PropTypes.bool,
  isLoadCustomerRequestCompleted: PropTypes.bool,
  userConsumerId: PropTypes.string,
  onlineStoreInfoFavicon: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  pageError: PropTypes.shape({
    code: PropTypes.number,
  }),
  isTngAuthorizationError: PropTypes.bool,
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
  loadConsumerCustomerInfo: PropTypes.func,
};

App.defaultProps = {
  userCountry: null,
  loginBannerPrompt: null,
  isUserLogin: false,
  isCashbackClaimRequestFulfilled: false,
  isConfirmSharingConsumerInfoCompleted: false,
  isLoadCustomerRequestCompleted: false,
  userConsumerId: null,
  onlineStoreInfoFavicon: '',
  error: {},
  pageError: {},
  isTngAuthorizationError: false,
  isLoginModalShown: false,
  appActions: {},
  loadConsumerCustomerInfo: () => {},
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      loginBannerPrompt: getLoginBannerPrompt(state),
      isLoginRequestStatusPending: getIsLoginRequestStatusPending(state),
      isUserLogin: getIsUserLogin(state),
      userConsumerId: getUserConsumerId(state),
      isCashbackClaimRequestFulfilled: getIsCashbackClaimRequestFulfilled(state),
      isConfirmSharingConsumerInfoCompleted: getIsConfirmSharingConsumerInfoCompleted(state),
      isLoadCustomerRequestCompleted: getIsLoadCustomerRequestCompleted(state),
      isLoginModalShown: getIsLoginModalShown(state),
      onlineStoreInfoFavicon: getOnlineStoreInfoFavicon(state),
      error: getError(state),
      pageError: getPageError(state),
      isTngAuthorizationError: getIsTngAuthorizationError(state),
      userCountry: getUserCountry(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      loadConsumerCustomerInfo: bindActionCreators(loadConsumerCustomerInfoThunk, dispatch),
    })
  )
)(App);
