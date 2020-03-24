import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getMessageModal,
  getError,
  getUser,
} from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import DocumentFavicon from '../../../components/DocumentFavicon';
import ErrorToast from '../../../components/ErrorToast';
import MessageModal from '../../components/MessageModal';
import Login from '../../components/Login';

class App extends Component {
  state = {};

  async componentDidMount() {
    const { appActions } = this.props;

    await appActions.getLoginStatus();
    await appActions.fetchOnlineStoreInfo();
    await appActions.loadCoreBusiness();

    const { user } = this.props;
    const { isLogin } = user || {};

    if (isLogin) {
      appActions.loadCustomerProfile();
    }

    this.getTokens(isLogin);
    // this.postAppMessage(user);
  }

  componentDidUpdate(prevProps) {
    const { appActions, user } = this.props;
    const { isExpired, isWebview, isLogin, isFetching } = user || {};

    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      // this.postAppMessage(user);
    }

    if (isLogin && !isFetching && prevProps.user.isLogin !== isLogin) {
      appActions.loadCustomerProfile();
    }
  }

  getTokens(isLogin) {
    const { appActions } = this.props;

    document.addEventListener(
      'acceptTokens',
      response => {
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
      },
      false
    );
  }

  // postAppMessage(user) {
  //   const { isWebview, isExpired } = user || {};

  //   if (isWebview && isExpired) {
  //     window.ReactNativeWebView.postMessage('tokenExpired');
  //   } else if (isWebview && !isExpired) {
  //     window.ReactNativeWebView.postMessage('getToken');
  //   }
  // }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  render() {
    const { error, messageModal, onlineStoreInfo } = this.props;
    const { message } = error || {};

    return (
      <main className="table-ordering">
        {message ? <ErrorToast message={message} clearError={this.handleClearError} /> : null}
        {messageModal.show ? <MessageModal data={messageModal} onHide={this.handleCloseMessageModal} /> : null}
        <Routes />
        <Login className="aside" />
        {onlineStoreInfo ? <DocumentFavicon icon={onlineStoreInfo.favicon} /> : null}
      </main>
    );
  }
}

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    user: getUser(state),
    error: getError(state),
    messageModal: getMessageModal(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  })
)(App);
