import React, { Component } from 'react';
import beepLoginImage from '../../../ordering/containers/Login/images/login.svg';
import Utils from '../../../utils/utils';
import './RequestLogin.scss';

class RequestLogin extends Component {
  constructor(props) {
    super(props);
    window.sendToken = res => this.authTokens(res);
  }

  componentDidUpdate(prevProps) {
    const { user } = this.props;
    const { isExpired, isWebview } = user || {};

    // token过期重新发postMessage
    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      this.postAppMessage(user);
    }
  }

  authTokens = async res => {
    if (res) {
      if (Utils.isIOSWebview()) {
        await this.loginBeepApp(res);
      } else if (Utils.isAndroidWebview()) {
        const data = JSON.parse(res) || {};
        await this.loginBeepApp(data);
      }
    }
  };

  loginBeepApp = async res => {
    const { actions } = this.props;
    if (res.access_token && res.refresh_token) {
      await actions.loginApp({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      });
    }
  };

  postAppMessage(user) {
    const { isExpired } = user || {};
    if (Utils.isAndroidWebview() && isExpired) {
      window.androidInterface.tokenExpired();
    }
    if (Utils.isAndroidWebview() && !isExpired) {
      window.androidInterface.getToken();
    }
    if (Utils.isIOSWebview() && isExpired) {
      window.webkit.messageHandlers.shareAction.postMessage({
        functionName: 'tokenExpired',
        callbackName: 'sendToken',
      });
    }
    if (Utils.isIOSWebview() && !isExpired) {
      window.webkit.messageHandlers.shareAction.postMessage({ functionName: 'getToken', callbackName: 'sendToken' });
    }
  }

  handleClick = () => {
    const { user } = this.props;
    this.postMessage(user);
  };

  render() {
    return (
      <section className="request-login flex flex-column flex-center">
        <section className="page-login__content text-center">
          <figure className="page-login__image-container">
            <img src={beepLoginImage} alt="otp" />
          </figure>
        </section>

        <p className="text-center text-size-big font-weight-bold padding-top-bottom-small">
          Login here to claim your cashback
        </p>
        <button onClick={this.handleClick} className="login-button login-button__fill">
          LOGIN
        </button>
      </section>
    );
  }
}

export default RequestLogin;
