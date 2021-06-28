import React from 'react';
import beepAppAppleStore from '../images/beep-app-apple-store.svg';
import beepAppGooglePlay from '../images/beep-app-google-play.svg';
import Utils from '../utils/utils';
import './DownloadBanner.scss';

function DownloadBanner(props) {
  const { link, text } = props;
  const client = Utils.judgeClient();

  return (
    <a
      className="download-banner flex flex-middle flex-space-around margin-small padding-top-bottom-small padding-left-right-normal"
      href={link}
      target={client === 'PC' ? '_blank' : ''}
    >
      <span className="download-banner__text text-weight-bolder">{text}</span>
      <img src={beepAppAppleStore} className="download-banner__store-icon margin-left-right-small" />
      <img src={beepAppGooglePlay} className="download-banner__store-icon" />
    </a>
  );
}

DownloadBanner.displayName = 'DownloadBanner';

export default DownloadBanner;
