import React from 'react';
import PropTypes from 'prop-types';
import beepAppAppleStore from '../images/beep-app-apple-store.svg';
import beepAppGooglePlay from '../images/beep-app-google-play.svg';
import Utils from '../utils/utils';
import Constants from '../utils/constants';
import './DownloadBanner.scss';

const { CLIENTS } = Constants;

function DownloadBanner(props) {
  const { link, text } = props;
  const client = Utils.judgeClient();
  const desktopClients = [CLIENTS.PC, CLIENTS.MAC];

  return (
    <a
      className="download-banner flex flex-middle flex-space-around margin-small padding-top-bottom-small padding-left-right-normal"
      href={link}
      rel="noreferrer"
      target={desktopClients.includes(client) ? '_blank' : ''}
    >
      <span className="download-banner__text text-weight-bolder">{text}</span>
      <img
        src={beepAppAppleStore}
        className="download-banner__store-icon margin-left-right-small"
        alt="Beep Apple Store Download"
      />
      <img src={beepAppGooglePlay} className="download-banner__store-icon" alt="Beep Google Play Download" />
    </a>
  );
}

DownloadBanner.displayName = 'DownloadBanner';

DownloadBanner.propTypes = {
  link: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default DownloadBanner;