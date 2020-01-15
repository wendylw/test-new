import React, { Component } from 'react';

class Message extends Component {
  render() {
    const regex = /(MSIE|Trident|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari(?!.+Edge)|(?!AppleWebKit.+)Chrome(?!.+Edge)|(?!AppleWebKit.+Chrome.+Safari.+)Edge|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d\.apre]+)/g;
    let showMessage = !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent) && !navigator.userAgent.match(regex);

    let device = navigator.userAgent;
    let browser = navigator.userAgent;
    let showMessage1 = !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
    let showMessage2 = !navigator.userAgent.match(regex);

    return (
      <div>
        device: {device}
        browser: {browser}
        showMessage1: {`${showMessage1}`}
        showMessage2: {`${showMessage2}`}
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
