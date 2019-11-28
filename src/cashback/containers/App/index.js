import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActions,
  getOnlineStoreInfo,
  getMessageInfo,
  getError,
  getUser,
} from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from '../../../components/ErrorToast';
import Message from '../../components/Message';
import Login from '../../components/Login';

class App extends Component {

  async componentDidMount() {
    const { appActions } = this.props;

    await appActions.getLoginStatus();
    await appActions.fetchOnlineStoreInfo();
    await appActions.fetchBusiness();

    const { user } = this.props;
    const { isLogin } = user || {};

    if (isLogin) {
      appActions.loadCustomerProfile();
    }

    this.getTokens(isLogin);
    this.postAppMessage(user);
  }

  componentDidUpdate(prevProps) {
    const { appActions, user } = this.props;
    const {
      isExpired,
      isWebview,
      isLogin,
    } = user || {};

    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      this.postAppMessage(user);
    }

    if (isLogin && prevProps.user.isLogin !== isLogin) {
      appActions.loadCustomerProfile();
    }
  }

  getTokens(isLogin) {
    const { appActions } = this.props;

    document.addEventListener('acceptTokens', (response) => {
      const { data } = response || {};

      if (data) {
        const tokenList = data.split(',');

        if (!isLogin) {
          appActions.loginApp({
            accessToken: tokenList[0],
            refreshToken: tokenList[1],
          });
        }
      }
    }, false);
  }

  postAppMessage(user) {
    const {
      isWebview,
      isExpired
    } = user || {};

    if (isWebview && isExpired) {
      window.ReactNativeWebView.postMessage('tokenExpired');
    } else if (isWebview && !isExpired) {
      window.ReactNativeWebView.postMessage('getToken');
    }
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  }

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  }

  render() {
    const {
      user,
      error,
    } = this.props;
    const {
      isFetching,
      prompt,
      isLogin,
    } = user || {};
    const { message } = error || {};

    return (
      <main className="loyalty">
        {
          message
            ? <ErrorToast message={message} clearError={this.handleClearError} />
            : null
        }
        <Message />
        {
          !isFetching || !isLogin
            ? <Login className="aside" title={prompt} />
            : null
        }
        <Routes />
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
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
  }),
)(App);
