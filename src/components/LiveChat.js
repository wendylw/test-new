import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _isUndefined from 'lodash/isUndefined';
import './LiveChat.scss';
import Utils from '../utils/utils';

const zendeskDepartmentId = Number(process.env.REACT_APP_ZENDESK_DEPARTMENT_ID);
class LiveChat extends Component {
  state = { renderingZendeskBtn: _isUndefined(window.$zopim) };
  zendeskButtonObserver = undefined;

  componentDidMount() {
    this.loadZendeskWidget().then(() => {
      window.zE('webWidget', 'show');
    });
    this.setObserver();
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
    this.zendeskButtonObserver && this.zendeskButtonObserver.disconnect();
    window.zE && window.zE('webWidget', 'hide');
  }

  sendOrderInfo = () => {
    const { orderId, name, phone } = this.props;
    window.zE('webWidget', 'chat:send', `Order number: ${orderId}\r\nCustomer name: ${name}\r\nPhone number: ${phone}`);
  };

  setObserver = () => {
    const config = { childList: true };
    this.zendeskButtonObserver = new MutationObserver(() => {
      if (document.getElementById('launcher')) {
        this.setState({ renderingZendeskBtn: false });
        this.zendeskButtonObserver.disconnect();
        window.$zopim?.livechat.badge.hide();
      }
    });
    this.zendeskButtonObserver.observe(document.body, config);
  };

  setOfflineFormGreeting = () => {
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

  loadZendeskWidget = () => {
    const { t } = this.props;
    if (!window.zE) {
      const zendeskScript = document.createElement('script');
      zendeskScript.src = process.env.REACT_APP_ZENDESK_SCRIPT_URL;
      zendeskScript.id = process.env.REACT_APP_ZENDESK_SCRIPT_ID;
      zendeskScript.async = true;
      const promisify = new Promise((resolve, reject) => {
        zendeskScript.onload = resolve;
        zendeskScript.onerror = reject;
      }).then(() => {
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
                  horizontal: '-20px',
                  vertical: '-3px',
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
      });
      document.body.appendChild(zendeskScript);
      return promisify;
    }

    return Promise.resolve();
  };

  render() {
    const { t } = this.props;
    const { renderingZendeskBtn } = this.state;

    return (
      renderingZendeskBtn && (
        <div className="live-chat flex flex-middle flex__shrink-fixed padding-left-right-small padding-top-bottom-normal">
          <div className="loader live-chat__loader margin-left-right-smaller"></div>
          <div className="live-chat__loading-text margin-left-right-smaller text-weight-bolder">{t('ContactUs')}</div>
        </div>
      )
    );
  }
}

LiveChat.propTypes = {
  orderId: PropTypes.string,
  name: PropTypes.string,
  phone: PropTypes.string,
};

export default withTranslation('Common')(LiveChat);
