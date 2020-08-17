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
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from '../../../components/ErrorToast';
import Message from '../../components/Message';
import Login from '../../components/Login';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';
import Utils from '../../../utils/utils';

class App extends Component {
  constructor(props) {
    super(props);
    window.sendToken = res => this.authTokens(res);
    this.postAppMessage(props.user);
  }

  async componentDidMount() {
    const { appActions } = this.props;

    this.visitErrorPage();
    await appActions.getLoginStatus();
    await appActions.fetchOnlineStoreInfo();
    await appActions.fetchBusiness();

    const { user } = this.props;
    const { isLogin } = user || {};

    if (isLogin) {
      appActions.loadCustomerProfile();
    }
    this.postAppMessage(user);
  }

  componentDidUpdate(prevProps) {
    const { appActions, user, pageError } = this.props;
    const { isExpired, isWebview, isLogin } = user || {};
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      this.postAppMessage(user);
    }

    if (isLogin && prevProps.user.isLogin !== isLogin) {
      appActions.loadCustomerProfile();
    }
  }

  visitErrorPage() {
    const { pageError } = this.props;

    if (pageError && pageError.code) {
      return (window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ERROR}`);
    }
  }

  authTokens = async res => {
    if (res) {
      if (Utils.isIOSWebview()) {
        await this.loginBeepApp(res);
      } else if (Utils.isAndroidWebview()) {
        const data = JSON.parse(res) || {};
        await this.loginBeepApp(data);
      }
    }
  };

  loginBeepApp = async res => {
    const { appActions } = this.props;
    if (res.access_token && res.refresh_token) {
      await appActions.loginApp({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      });
    }
  };

  postAppMessage(user) {
    const { isExpired } = user || {};
    if (Utils.isAndroidWebview() && isExpired) {
      window.androidInterface.tokenExpired();
    }
    if (Utils.isAndroidWebview() && !isExpired) {
      window.androidInterface.getToken();
    }
    if (Utils.isIOSWebview() && isExpired) {
      window.webkit.messageHandlers.shareAction.postMessage({
        functionName: 'tokenExpired',
        callbackName: 'sendToken',
      });
    }
    if (Utils.isIOSWebview() && !isExpired) {
      window.webkit.messageHandlers.shareAction.postMessage({ functionName: 'getToken', callbackName: 'sendToken' });
    }
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  render() {
    const { user, error, onlineStoreInfo } = this.props;
    const { isFetching, prompt, isLogin } = user || {};
    const { message } = error || {};
    const { favicon } = onlineStoreInfo || {};

    return (
      <main className="loyalty">
        {message ? <ErrorToast message={message} clearError={this.handleClearError} /> : null}
        <Message />
        {!isFetching || !isLogin ? <Login className="aside" title={prompt} /> : null}
        <Routes />
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
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
