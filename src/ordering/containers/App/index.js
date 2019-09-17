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
import 'normalize.css';
import '../../../App.scss';
import ErrorToast from './components/ErrorToast';
import MessageModal from '../../../components/ErrorToast';

// import Login from '../../components/Login';

class App extends Component {
  state = {};

  componentWillMount() {
    this.getTokens();
  }

  async componentDidMount() {
    const { appActions } = this.props;

    await appActions.fetchOnlineStoreInfo();

    this.postAppMessage();
  }

  async getTokens() {
    const { appActions } = this.props;
    await appActions.getLoginStatus();

    const { user } = this.props;
    const { isLogin } = user || {};

    alert('oldLogin====>' + isLogin);

    document.addEventListener('acceptTokens', async (response) => {
      const { data } = response || {};

      if (data) {
        const tokenList = data.split(',');

        alert('oldLogin====>' + isLogin);

        if (!isLogin) {
          await appActions.loginApp({
            accessToken: tokenList[0],
            refreshToken: tokenList[1],
          });

          alert('props====>' + JSON.stringify(this.props));
          alert('newLogin====>' + this.props.isLogin);
        }
      }
    }, false);
  }

  postAppMessage() {
    const {
      error,
      user,
    } = this.props;
    const { isWebview } = user;
    const { isExpired } = error;

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
