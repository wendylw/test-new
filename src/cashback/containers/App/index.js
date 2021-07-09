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
import * as NativeMethods from '../../../utils/native-methods';
import Utils from '../../../utils/utils';
import loggly from '../../../utils/monitoring/loggly';
import _isNil from 'lodash/isNil';

class App extends Component {
  state = {
    showAppLoginPage: false,
  };

  async componentDidMount() {
    const { appActions } = this.props;
    this.visitErrorPage();
    await appActions.getLoginStatus();
    await appActions.fetchOnlineStoreInfo();
    await appActions.fetchBusiness();

    const { user } = this.props;
    const { isLogin } = user || {};

    if (Utils.isWebview()) {
      const appLogin = this.getAppLoginStatus();

      this.setState({
        showAppLoginPage: !appLogin && !isLogin,
      });

      if (appLogin && !isLogin) {
        await this.postAppMessage();
      }
    }
  }

  getAppLoginStatus() {
    try {
      return NativeMethods.getLoginStatus();
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  componentDidUpdate = async prevProps => {
    const { appActions, user, pageError } = this.props;
    const { isExpired, isLogin } = user || {};
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    // token过期重新发postMessage
    if (isExpired && prevProps.user.isExpired !== isExpired && Utils.isWebview()) {
      await this.postAppMessage();
    }

    if (isLogin && prevProps.user.isLogin !== isLogin) {
      this.setState({
        showAppLoginPage: false,
      });

      appActions.loadCustomerProfile();
    }
  };

  postAppMessage = async () => {
    const { appActions, user } = this.props;
    const { isExpired } = user || {};

    const res = isExpired ? await NativeMethods.tokenExpiredAsync() : await NativeMethods.getTokenAsync();
    if (_isNil(res)) {
      loggly.error('cashback.post-app-message', { message: 'native token is invalid' });
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
    const { showAppLoginPage } = this.state;

    if (showAppLoginPage) {
      return <RequestLogin user={user} onClick={this.postAppMessage} />;
    }

    return this.renderMainContent();
  }
}

App.displayName = 'CashbackApp';

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
