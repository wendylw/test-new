import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _isUndefined from 'lodash/isUndefined';
import './LiveChat.scss';

const zendeskDepartmentId = 2147674363;
class LiveChat extends Component {
  state = { renderingZendeskBtn: _isUndefined(window.zE) };
  zendeskButtonObserver = undefined;

  componentDidMount() {
    this.loadZendeskWidget().then(() => {
      window.zE('webWidget', 'show');
    });
  }

  componentDidUpdate() {
    const { name, phone } = this.props;
    window.zE &&
      window.zE('webWidget', 'prefill', {
        name: {
          value: name,
        },
        email: {
          value: 'user@example.com',
        },
        phone: {
          value: phone,
        },
      });
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
      zendeskScript.src = 'https://static.zdassets.com/ekr/snippet.js?key=3d4279e8-9891-42d5-8264-c96951ff1fd8';
      zendeskScript.id = 'ze-snippet';
      zendeskScript.async = true;
      const promisify = new Promise((resolve, reject) => {
        zendeskScript.onload = resolve;
        zendeskScript.onerror = reject;
      }).then(() => {
        this.setObserver();
        window.zESettings = {
          webWidget: {
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
              departments: {
                enabled: [zendeskDepartmentId],
                select: zendeskDepartmentId,
              },
            },
          },
        };
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
        <div className="live-chat">
          <div className="loader live-chat__loader"></div>
          <div className="live-chat__loading-text">{t('ContactUs')}</div>
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
