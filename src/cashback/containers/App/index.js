import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActions,
  getOnlineStoreInfo,
  getError,
  getUser,
} from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from '../../../components/ErrorToast';

class App extends Component {
  componentWillMount() {
    const { appActions } = this.props;

    this.getTokens();
    appActions.getLoginStatus();
  }

  async componentDidMount() {
    const {
      fetchOnlineStoreInfo,
      fetchBusiness,
    } = this.props.appActions;

    await fetchOnlineStoreInfo();
    await fetchBusiness();

    this.postExpiredMessage();
  }

  getTokens() {
    const { appActions } = this.props;

    document.addEventListener('acceptTokens', async (response) => {
      const { data } = response || {};

      if (data) {
        const tokenList = data.split(',');

        await appActions.loginApp({
          accessToken: tokenList[0],
          refreshToken: tokenList[1],
        });

        alert('loginStatus====>' + this.props.user.isLogin)
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
    const { error } = this.props;
    const { message } = error || {};

    return (
      <main className="loyalty">
        <Routes />
        {
          message
            ? <ErrorToast message={message} clearError={this.handleClearError} />
            : null
        }
      </main>
    );
  }
}

export default connect(
  state => ({
    user: getUser(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    error: getError(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
  }),
)(App);
