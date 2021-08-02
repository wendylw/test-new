import React from 'react';
import PropTypes from 'prop-types';
import beepAppAppleStore from '../images/beep-app-apple-store.svg';
import beepAppGooglePlay from '../images/beep-app-google-play.svg';
import Utils from '../utils/utils';
import Constants from '../utils/constants';
const { DELIVERY_METHOD } = Constants;
import './DownloadBanner.scss';

const DOWNLOAD_MAPPING = {
  [DELIVERY_METHOD.DELIVERY]: {
    link: 'https://storehub.page.link/c8Ci',
    text: 'Discover 1,000+ More Restaurants Download the Beep app now!',
  },
  [DELIVERY_METHOD.PICKUP]: {
    link: 'https://storehub.page.link/c8Ci',
    text: 'Discover 1,000+ More Restaurants Download the Beep app now!',
  },
  [DELIVERY_METHOD.DINE_IN]: {
    link: 'https://dl.beepit.com/kVmT',
    text: 'Download the Beep app to track your Order History!',
  },
  [DELIVERY_METHOD.TAKE_AWAY]: {
    link: 'https://dl.beepit.com/kVmT',
    text: 'Download the Beep app to track your Order History!',
  },
};

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

DownloadBanner.propTypes = {
  orderDelayReason: PropTypes.string,
};

export default DownloadBanner;
