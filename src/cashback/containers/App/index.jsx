import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import faviconImage from '../../../images/favicon.ico';
import {
  actions as appActionCreators,
  getError,
  getLoginBannerPrompt,
  getIsUserLogin,
  getIsLoginRequestStatusPending,
  getIsLoginModalShown,
  getIsClaimCashbackPage,
} from '../../redux/modules/app';
import { getPageError } from '../../../redux/modules/entities/error';
import Constants from '../../../utils/constants';
import { isWebview } from '../../../common/utils';
import { isAlipayMiniProgram } from '../../../common/utils/alipay-miniprogram-client';
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
      await appActions.fetchCashbackBusiness();
      await appActions.loadConsumerLoginStatus();

      const { isUserLogin } = this.props;

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
    const { t, error, loginBannerPrompt, isLoginModalShown, appActions, isClaimCashbackPage } = this.props;
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
        <DocumentFavicon icon={faviconImage} />
      </main>
    );
  }
}

App.displayName = 'CashbackApp';

App.propTypes = {
  loginBannerPrompt: PropTypes.string,
  isUserLogin: PropTypes.bool,
  isClaimCashbackPage: PropTypes.bool,
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
    resetConsumerCustomerInfo: PropTypes.func,
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
  loginBannerPrompt: null,
  isUserLogin: false,
  isClaimCashbackPage: false,
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
      isClaimCashbackPage: getIsClaimCashbackPage(state),
      isLoginModalShown: getIsLoginModalShown(state),
      error: getError(state),
      pageError: getPageError(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
