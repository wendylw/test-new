import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActions,
  getOnlineStoreInfo,
  getMessageModal,
  getError,
  getUser,
} from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from '../../../components/ErrorToast';
import MessageModal from '../../components/MessageModal';
import Login from '../../components/Login';

class App extends Component {
  state = {};

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
    const { appActions } = this.props;

    await appActions.fetchOnlineStoreInfo();

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
      messageModal
    } = this.props;
    const { isLogin } = user || {};
    const { message } = error || {};

    return (
      <main className="table-ordering">
        {
          message
            ? <ErrorToast message={message} clearError={this.handleClearError} />
            : null
        }
        {
          messageModal.show
            ? (
              <MessageModal
                data={messageModal}
                onHide={this.handleCloseMessageModal}
              />
            )
            : null
        }
        {
          !isLogin
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
    onlineStoreInfo: getOnlineStoreInfo(state),
    user: getUser(state),
    error: getError(state),
    messageModal: getMessageModal(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
  }),
)(App);
