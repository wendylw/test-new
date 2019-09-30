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
import MessageModal from '../../components/MessageModal';
import Message from '../../components/Message';
import Login from '../../components/Login';

class App extends Component {
  async componentWillMount() {
    const { appActions } = this.props;
    await appActions.getLoginStatus();

    const { user } = this.props;
    const { isLogin } = user || {};

    this.getTokens(isLogin);
  }

  componentWillReceiveProps(nextProps) {
    const { user } = nextProps;
    const {
      isExpired,
      isWebview,
    } = user || {};

    if (isExpired && this.props.user.isExpired !== isExpired) {
      if (isWebview) {
        this.postAppMessage(user);
      }
    }
  }

  async componentDidMount() {
    const {
      fetchOnlineStoreInfo,
      fetchBusiness,
    } = this.props.appActions;

    await fetchOnlineStoreInfo();
    await fetchBusiness();

    const { user } = this.props;

    this.postAppMessage(user);
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
      messageInfo,
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
        {
          !isFetching || !isLogin
            ? <Login title={prompt} />
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
