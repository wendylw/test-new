import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _isUndefined from 'lodash/isUndefined';
import './LiveChat.scss';
import Utils from '../utils/utils';

const zendeskDepartmentId = Number(process.env.REACT_APP_ZENDESK_DEPARTMENT_ID);
class LiveChat extends Component {
  state = { waitingZendeskScript: false };

  componentDidMount() {
    this.loadZendeskWidget().then(() => {
      window.zE('webWidget', 'show');
    });
  }

  componentDidUpdate(prevProps) {
    const { name, phone } = this.props;

    if (prevProps.name !== name && prevProps.phone !== phone && window.zE) {
      window.zE('webWidget', 'prefill', {
        name: {
          value: name,
        },
        phone: {
          value: phone,
        },
      });
    }
  }

  componentWillUnmount() {
    window.zE && window.zE('webWidget', 'hide');
  }

  sendOrderInfo = () => {
    const { orderId, name, phone } = this.props;
    window.zE('webWidget', 'chat:send', `Order number: ${orderId}\r\nCustomer name: ${name}\r\nPhone number: ${phone}`);
  };

  setOfflineFormGreeting = () => {
    this.setState({ waitingZendeskScript: false });
    const department = window.zE('webWidget:get', 'chat:department', zendeskDepartmentId);
    if (department.status !== 'online') {
      window.zE('webWidget', 'updateSettings', {
        webWidget: {
          chat: {
            prechatForm: {
              greeting: {
                '*': `Sorry, we aren't online at the moment. Leave a message and we'll get back to you.`,
              },
            },
          },
        },
      });
    }
  };

  initZendesk = () => {
    const { t } = this.props;
    const isMobile = Utils.getUserAgentInfo().isMobile;
    if (isMobile) {
      window.zESettings = {
        webWidget: {
          navigation: {
            popoutButton: {
              enabled: false,
            },
          },
          position: {
            horizontal: 'right',
            vertical: 'top',
          },
          offset: {
            mobile: {
              horizontal: '-200px',
            },
          },
          color: {
            launcher: '#FFFFFF',
            launcherText: '#00b0ff',
          },
          launcher: {
            mobile: {
              labelVisible: true,
            },
            chatLabel: {
              '*': t('ContactUs'),
            },
          },
          chat: {
            connectOnPageLoad: false,
            title: {
              '*': 'Beep Live Chat',
            },
            departments: {
              enabled: [zendeskDepartmentId],
              select: zendeskDepartmentId,
            },
          },
        },
      };
    } else {
      window.zESettings = {
        webWidget: {
          navigation: {
            popoutButton: {
              enabled: false,
            },
          },
          launcher: {
            chatLabel: {
              '*': t('ContactUs'),
            },
          },
          chat: {
            title: {
              '*': 'Beep Live Chat',
            },
            departments: {
              enabled: [zendeskDepartmentId],
              select: zendeskDepartmentId,
            },
          },
        },
      };
    }
    window.zE('webWidget:on', 'chat:start', this.sendOrderInfo);
    window.zE('webWidget:on', 'chat:connected', this.setOfflineFormGreeting);
  };

  loadZendeskWidget = () => {
    if (!window.zE) {
      const zendeskScript = document.createElement('script');
      zendeskScript.src = process.env.REACT_APP_ZENDESK_SCRIPT_URL;
      zendeskScript.id = process.env.REACT_APP_ZENDESK_SCRIPT_ID;
      zendeskScript.async = true;
      zendeskScript.defer = true;
      const promisify = new Promise((resolve, reject) => {
        zendeskScript.onload = resolve;
        zendeskScript.onerror = reject;
      }).then(() => {
        this.initZendesk();
      });
      document.body.appendChild(zendeskScript);
      return promisify;
    }

    return Promise.resolve();
  };

  handleBtnClicked = () => {
    const { waitingZendeskScript } = this.state;

    if (!waitingZendeskScript) {
      window.zE('webWidget', 'toggle');
      if (!window.$zopim?.livechat) {
        this.setState({ waitingZendeskScript: true });
      }
    }
  };

  render() {
    const { t } = this.props;
    const { waitingZendeskScript } = this.state;

    return (
      <button
        className={`button live-chat flex flex-middle flex__shrink-fixed padding-left-right-small padding-top-bottom-normal ${
          waitingZendeskScript ? 'live-chat__loading' : ''
        }`}
        onClick={this.handleBtnClicked}
      >
        {waitingZendeskScript && <div className="loader live-chat__loader margin-left-right-smaller"></div>}
        <div className="live-chat__loading-text margin-left-right-smaller">{t('ContactUs')}</div>
      </button>
    );
  }
}

LiveChat.propTypes = {
  orderId: PropTypes.string,
  name: PropTypes.string,
  phone: PropTypes.string,
};

export default withTranslation('Common')(LiveChat);
