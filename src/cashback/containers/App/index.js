import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from '../../../components/ErrorToast';

class App extends Component {
  componentWillMount() {
    const { appActions } = this.props;

    this.getTokens();
    this.postExpiredMessage();

    appActions.getLoginStatus();
  }

  componentDidMount() {
    const {
      fetchOnlineStoreInfo,
      fetchBusiness,
    } = this.props.appActions;

    fetchOnlineStoreInfo();
    fetchBusiness();
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
    onlineStoreInfo: getOnlineStoreInfo(state),
    error: getError(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
  }),
)(App);
