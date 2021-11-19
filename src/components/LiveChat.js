import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './LiveChat.scss';
class LiveChat extends Component {
  state = { waitingZendeskScript: false, orderSent: false };

  componentDidMount() {
    window.intercomSettings = {
      app_id: 'v2axofpf',
      custom_launcher_selector: '#beep-live-chat-launcher',
    };
    (function() {
      var w = window;
      var ic = w.Intercom;
      if (typeof ic === 'function') {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
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
          s.src = 'https://widget.intercom.io/widget/v2axofpf';
          var x = d.getElementsByTagName('script')[0];
          x.parentNode.insertBefore(s, x);
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

  componentWillUnmount() {}

  handleClick = () => {
    const { orderId, name, phone } = this.props;
    const { orderSent } = this.state;
    if (!orderSent) {
      window.Intercom('showNewMessage', `Order number: ${orderId}\r\nCustomer name: ${name}\r\nPhone number: ${phone}`);
      this.setState({ orderSent: true });
    }
  };

  render() {
    const { t } = this.props;
    const { waitingZendeskScript } = this.state;

    return (
      <button
        className={`button live-chat flex flex-middle flex__shrink-fixed padding-left-right-small padding-top-bottom-normal ${
          waitingZendeskScript ? 'text-opacity' : ''
        }`}
        onClick={this.handleClick}
        id="beep-live-chat-launcher"
      >
        {waitingZendeskScript && <div className="loader live-chat__loader margin-left-right-smaller"></div>}
        <div className="live-chat__loading-text margin-left-right-smaller">{`${t('NeedHelp')}?`}</div>
      </button>
    );
  }
}

LiveChat.propTypes = {
  orderId: PropTypes.string,
  name: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
  onClick: PropTypes.func,
};

LiveChat.displayName = 'LiveChat';

export default withTranslation('Common')(LiveChat);
