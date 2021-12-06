import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getUserConsumerId, getUserIsLogin } from '../ordering/redux/modules/app';
import { getLiveChatUserProfile } from '../ordering/containers/order-status/redux/selector';
import './LiveChat.scss';

class LiveChat extends Component {
  state = { hasScriptLoaded: false };

  componentDidMount() {
    this.launchIntercomMessenger();
  }

  launchIntercomMessenger() {
    const { userId, hasUserLoggedIn, orderId: order_id, storeName: store_name, userProfile } = this.props;
    const userInfo = hasUserLoggedIn ? { user_id: userId, ...userProfile } : {};

    window.intercomSettings = {
      app_id: process.env.REACT_APP_INTERCOM_APP_ID,
      custom_launcher_selector: '#beep-live-chat-launcher',
      hide_default_launcher: true,
      order_id,
      store_name,
      department: 'beep',
      ...userInfo,
    };

    const loadSuccessHandler = () => {
      this.setState({ hasScriptLoaded: true });
    };

    const loadFailedHandler = err => {
      delete window.Intercom;
      window.newrelic?.addPageAction('common.intercom-load-failure', {
        error: err?.message,
      });
      this.setState({ hasScriptLoaded: false });
    };

    // Copy from intercom JS library
    (function() {
      var w = window;
      var ic = w.Intercom;
      if (typeof ic === 'function') {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
        loadSuccessHandler();
      } else {
        var d = document;
        var i = function() {
          i.c(arguments);
        };
        i.q = [];
        i.c = function(args) {
          i.q.push(args);
        };
        w.Intercom = i;
        var l = function() {
          var s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = process.env.REACT_APP_INTERCOM_SCRIPT_URL;
          var x = d.getElementsByTagName('script')[0];
          x.parentNode.insertBefore(s, x);
          s.onload = loadSuccessHandler;
          s.onerror = loadFailedHandler;
        };
        if (document.readyState === 'complete') {
          l();
        } else if (w.attachEvent) {
          w.attachEvent('onload', l);
        } else {
          w.addEventListener('load', l, false);
        }
      }
    })();
  }

  updateIntercomSettings(profileInfo) {
    const prevSettings = window.intercomSettings;
    window.intercomSettings = { ...prevSettings, ...profileInfo };
    window.Intercom?.('update', window.intercomSettings);
  }

  componentDidUpdate(prevProps) {
    const { userProfile: prevUserProfile } = prevProps;
    const { userProfile: currUserProfile } = this.props;

    if (prevUserProfile !== currUserProfile) {
      const { name, phone, email } = currUserProfile;
      this.updateIntercomSettings({ name, phone, email });
    }
  }

  componentWillUnmount() {
    window.Intercom?.('shutdown');
  }

  handleClick = () => {
    window.Intercom?.('show');
  };

  render() {
    const { t } = this.props;
    const { hasScriptLoaded } = this.state;

    return (
      <button
        className="button live-chat flex flex-middle flex__shrink-fixed padding-left-right-small padding-top-bottom-normal"
        onClick={this.handleClick}
        id="beep-live-chat-launcher"
        disabled={!hasScriptLoaded}
      >
        {!hasScriptLoaded && <div className="loader live-chat__loader margin-left-right-smaller"></div>}
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
  withTranslation('Common'),
  connect(state => ({
    hasUserLoggedIn: getUserIsLogin(state),
    userId: getUserConsumerId(state),
    userProfile: getLiveChatUserProfile(state),
  }))
)(LiveChat);
