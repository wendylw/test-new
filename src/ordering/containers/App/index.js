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

import Login from '../../components/Login';

// import OtpModal from '../../../components/OtpModal';

class App extends Component {
  state = {};

  componentWillMount() {
    const { appActions } = this.props;

    this.getTokens();
    this.postExpiredMessage();

    appActions.getLoginStatus();
  }

  async componentDidMount() {
    const { appActions } = this.props;

    await appActions.fetchOnlineStoreInfo();

    this.postExpiredMessage();
  }

  getTokens() {
    const { appActions } = this.props;

    document.addEventListener('acceptTokens', (response) => {
      const { data } = response || {};

      if (data) {
        const tokenList = data.split(',');

        appActions.loginApp({
          accessToken: tokenList[0],
          refreshToken: tokenList[1],
        });
      }
    }, false);
  }

  postExpiredMessage() {
    const {
      error,
      user,
    } = this.props;
    const { isWebview } = user;
    const { isExpired } = error;

    if (isWebview && isExpired) {
      window.ReactNativeWebView.postMessage('tokenExpired');
    }
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  }

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  }

  render() {
    const { error, messageModal } = this.props;
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
        <Login />
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
