import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getMessageInfo,
  getError,
  getUser,
} from '../../redux/modules/app';
import { getPageError } from '../../../redux/modules/entities/error';
import Constants from '../../../utils/constants';
import '../../../Common.scss';
import './Loyalty.scss';
import Routes from '../Routes';
import ErrorToast from '../../../components/ErrorToast';
import Message from '../../components/Message';
import Login from '../../components/Login';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';
import RequestLogin from './components/RequestLogin';
import { NativeMethods } from '../../../utils/dsbridge-methods';

class App extends Component {
  async componentDidMount() {
    const { appActions } = this.props;
    this.visitErrorPage();
    await appActions.getLoginStatus();
    await appActions.fetchOnlineStoreInfo();
    await appActions.fetchBusiness();

    const { user } = this.props;
    const { isLogin, isWebview } = user || {};

    let appLogin;
    try {
      appLogin = NativeMethods.getLoginStatus();
    } catch (e) {
      console.error(e);
    }
    if (isLogin) {
      appActions.loadCustomerProfile();
    }

    // appLogin is true, isLogin is false
    if (isWebview && !isLogin && appLogin) {
      await this.postAppMessage();
    }
  }

  componentDidUpdate = async prevProps => {
    const { appActions, user, pageError } = this.props;
    const { isExpired, isWebview, isLogin } = user || {};
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    // token过期重新发postMessage
    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      await this.postAppMessage();
    }

    if (isLogin && prevProps.user.isLogin !== isLogin) {
      appActions.loadCustomerProfile();
    }
  };

  postAppMessage = async () => {
    const { appActions, user } = this.props;
    const { isExpired } = user || {};
    const touchPoint = 'ClaimCashback';

    let res = isExpired ? await NativeMethods.tokenExpired(touchPoint) : await NativeMethods.getToken(touchPoint);
    if (res === null || res === 'undefined') {
      console.log('native token is invalid');
    } else {
      const { access_token, refresh_token } = res;
      await appActions.loginApp({
        accessToken: access_token,
        refreshToken: refresh_token,
      });
    }
  };

  visitErrorPage() {
    const { pageError } = this.props;

    if (pageError && pageError.code) {
      return (window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ERROR}`);
    }
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  renderMainContent() {
    const { user, error, onlineStoreInfo } = this.props;
    const { isFetching, prompt, isLogin } = user || {};
    const { message } = error || {};
    const { favicon } = onlineStoreInfo || {};

    return (
      <main className="loyalty fixed-wrapper__main fixed-wrapper">
        {message ? <ErrorToast className="fixed" message={message} clearError={this.handleClearError} /> : null}
        <Message />
        {!isFetching || !isLogin ? <Login className="aside fixed-wrapper" title={prompt} /> : null}
        <Routes />
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }

  render() {
    const { user } = this.props;
    const { isWebview } = user || {};
    const appLogin = NativeMethods.getLoginStatus();

    return !appLogin && isWebview ? (
      <RequestLogin user={user} onClick={this.postAppMessage} />
    ) : (
      this.renderMainContent()
    );
  }
}

export default connect(
  state => ({
    user: getUser(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    messageInfo: getMessageInfo(state),
    error: getError(state),
    pageError: getPageError(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  })
)(App);
