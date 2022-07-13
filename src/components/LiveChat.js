import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _isFunction from 'lodash/isFunction';
import { Headset } from 'phosphor-react';
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
      app_base: process.env.REACT_APP_INTERCOM_APP_BASE,
      app_id: process.env.REACT_APP_INTERCOM_APP_ID,
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
    const { onClick } = this.props;
    const { hasScriptLoaded } = this.state;

    if (!hasScriptLoaded) return;

    _isFunction(onClick) && onClick();
    window.Intercom?.('show');
  };

  render() {
    const { t } = this.props;
    const { hasScriptLoaded } = this.state;

    return (
      <button
        className={`button live-chat flex flex-middle flex__shrink-fixed sm:tw-px-6px tw-px-6 sm:tw-py-16px tw-py-16 ${
          hasScriptLoaded ? '' : 'text-opacity'
        }`}
        onClick={this.handleClick}
      >
        {!hasScriptLoaded && <div className="loader live-chat__loader margin-left-right-smaller"></div>}
        <div className="live-chat__loading-text margin-left-right-smaller tw-flex tw-items-center">
          <Headset weight="fill" className="tw-flex-shrink-0 sm:tw-mx-2px tw-mx-2" size={20} />
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed sm:tw-px-2px tw-px-2">{`${t('Help')}`}</span>
        </div>
      </button>
    );
  }
}

LiveChat.propTypes = {
  storeName: PropTypes.string,
  orderId: PropTypes.string,
  userId: PropTypes.string,
  onClick: PropTypes.func,
  hasUserLoggedIn: PropTypes.bool,
  userProfile: PropTypes.object,
};

LiveChat.defaultProps = {
  storeName: '',
  orderId: '',
  userId: '',
  onClick: () => {},
  hasUserLoggedIn: false,
  userProfile: {},
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
