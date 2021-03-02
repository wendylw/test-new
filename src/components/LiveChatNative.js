import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import DsbridgeContainer, { nativeMethods } from '../utils/dsbridge-methods';
import './LiveChat.scss';

class LiveChatNative extends Component {
  startChat = () => {
    const { orderId, name, phone, email, storeName } = this.props;
    const message = `Order number: ${orderId}\nStore Name: ${storeName}`;

    DsbridgeContainer.callMethodFromNative(nativeMethods.startChat(phone, name, email, message));
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
