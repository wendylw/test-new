import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Utils from '../utils/utils';
import './LiveChat.scss';

class LiveChatNative extends Component {
  startChat = () => {
    const { orderId, name, phone, email, storeName } = this.props;
    const message = `Order number: ${orderId}\nStore Name: ${storeName}`;

    if (Utils.isAndroidWebview()) {
      window.androidInterface.startChat(
        JSON.stringify({
          phoneNumber: phone,
          name,
          email,
          message,
        })
      );
    }

    if (Utils.isIOSWebview()) {
      window.webkit.messageHandlers.shareAction.postMessage({
        functionName: 'startChat',
        phoneNumber: phone,
        name,
        email,
        message,
      });
    }
  };

  render() {
    const { t } = this.props;
    return (
      <button
        className="button live-chat flex flex-middle flex__shrink-fixed padding-left-right-small padding-top-bottom-normal"
        onClick={this.startChat}
      >
        <div div className="live-chat__loading-text margin-left-right-smaller">{`${t('NeedHelp')}?`}</div>
      </button>
    );
  }
}

export default withTranslation('Common')(LiveChatNative);
