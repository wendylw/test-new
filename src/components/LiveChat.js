import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getUserConsumerId, getUserIsLogin } from '../ordering/redux/modules/app';
import './LiveChat.scss';

class LiveChat extends Component {
  state = { hasIntercomLoaded: false, orderSent: false };

  componentDidMount() {
    this.launchIntercomMessenger();
  }

  launchIntercomMessenger() {
    const { name, phone, email, userId, hasUserLoggedIn } = this.props;

    const userModeInfo = hasUserLoggedIn ? { user_id: userId, name, email, phone } : {};

    window.intercomSettings = {
      app_id: 'v2axofpf',
      custom_launcher_selector: '#beep-live-chat-launcher',
      hide_default_launcher: true,
      ...userModeInfo,
    };

    const intercom = window.Intercom;

    if (typeof intercom === 'function') {
      intercom('reattach_activator');
      intercom('update', window.intercomSettings);
    } else {
      this.loadIntercomScript();
    }
  }

  loadIntercomScript() {
    const i = function(...args) {
      i.c(args);
    };
    i.q = [];
    i.c = args => {
      i.q.push(args);
    };
    window.Intercom = i;
    if (document.readyState === 'complete') {
      this.createIntercomScript();
    } else if (window.attachEvent) {
      window.attachEvent('onload', this.createIntercomScript());
    } else {
      window.addEventListener('load', this.createIntercomScript(), false);
    }
  }

  createIntercomScript() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://widget.intercom.io/widget/v2axofpf';
    const element = document.getElementsByTagName('script')[0];
    element.parentNode.insertBefore(script, element);
    script.addEventListener('load', () => this.setState({ hasIntercomLoaded: true }), false);
  }

  componentWillUnmount() {
    window.Intercom('shutdown');
  }

  handleClick = () => {
    const { t, orderId, storeName } = this.props;
    const { orderSent } = this.state;
    if (!orderSent) {
      window.Intercom(
        'showNewMessage',
        `Order number: ${orderId}\nStore name: ${storeName}\n${t('ClickSendButtonHint', { ns: 'LiveChat' })}`
      );
      this.setState({ orderSent: true });
    }
  };

  render() {
    const { t } = this.props;
    const { hasIntercomLoaded } = this.state;

    return (
      <button
        className="button live-chat flex flex-middle flex__shrink-fixed padding-left-right-small padding-top-bottom-normal"
        onClick={this.handleClick}
        id="beep-live-chat-launcher"
        disabled={!hasIntercomLoaded}
      >
        {!hasIntercomLoaded && <div className="loader live-chat__loader margin-left-right-smaller"></div>}
        <div className="live-chat__loading-text margin-left-right-smaller">{`${t('NeedHelp')}?`}</div>
      </button>
    );
  }
}

LiveChat.propTypes = {
  name: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
  storeName: PropTypes.string,
  orderId: PropTypes.string,
  userId: PropTypes.string,
  onClick: PropTypes.func,
};

LiveChat.displayName = 'LiveChat';

export default compose(
  withTranslation(['Common', 'LiveChat']),
  connect(state => ({
    hasUserLoggedIn: getUserIsLogin(state),
    userId: getUserConsumerId(state),
  }))
)(LiveChat);
