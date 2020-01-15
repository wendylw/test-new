import React, { Component } from 'react';

class Message extends Component {
  render() {
    let showMessage = !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);

    return (
      <div>
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
