import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActions,
  getOnlineStoreInfo,
  getError,
  getUser,
  getMessageModal
} from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from './components/ErrorToast';
import MessageModal from '../../../components/ErrorToast';

// import Login from '../../components/Login';

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
    const {
      user,
      isWebview
    } = nextProps;
    const { isExpired } = user || {};

    if (isExpired && this.props.user.isExpired !== isExpired) {
      alert('newExpired====>' + isExpired);
      alert('isWebview====>' + isWebview);

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

      alert('isLogin====>' + isLogin);

      if (data) {
        const tokenList = data.split(',');

        if (!isLogin) {
          appActions.loginApp({
            accessToken: tokenList[0],
            refreshToken: tokenList[1],
          });

          alert('newUsr====>' + JSON.stringify(this.props.user));
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
      error,
      messageModal
    } = this.props;
    const { message } = error || {};

    return (
      <main className="table-ordering">
        <Routes />
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
        {/* <Login /> */}
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
