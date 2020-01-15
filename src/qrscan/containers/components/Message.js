import React, { Component } from 'react';

class Message extends Component {
  render() {
    let showMessage;

    showMessage = !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAge) && navigator.userAgent.indexOf('Chrome') === -1;
    let device = navigator.userAge;
    let browser = navigator.userAgent;

    return (
      <div>
        {device}
        {browser}
        {showMessage ? (
          <div className="top-message primary fixed">
            <div className="top-message__text">We recommend that you use Google Chrome</div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Message;
