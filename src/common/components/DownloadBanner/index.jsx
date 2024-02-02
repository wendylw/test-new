import React from 'react';
import PropTypes from 'prop-types';
import beepAppAppleStore from '../../../images/beep-app-apple-store.svg';
import beepAppGooglePlay from '../../../images/beep-app-google-play.svg';
import { judgeClient, getIsDesktopClients } from '../../utils';
import { ObjectFitImage } from '../Image';
import styles from './DownloadBanner.module.scss';

const DownloadBanner = ({ link, text }) => {
  const isDesktopClient = getIsDesktopClients(judgeClient());

  return (
    <a className={styles.DownloadBanner} href={link} rel="noreferrer" target={isDesktopClient ? '_blank' : ''}>
      <span className={styles.DownloadBannerText}>{text}</span>
      <div className={styles.DownloadBannerAppStoreIcon}>
        <ObjectFitImage noCompression src={beepAppAppleStore} alt="Beep Apple Store Download" />
      </div>
      <div className={styles.DownloadBannerAppStoreIcon}>
        <ObjectFitImage noCompression src={beepAppGooglePlay} alt="Beep Google Play Download" />
      </div>
    </a>
  );
};

DownloadBanner.displayName = 'DownloadBanner';

DownloadBanner.propTypes = {
  link: PropTypes.string,
  text: PropTypes.string,
};

DownloadBanner.defaultProps = {
  link: '',
  text: '',
};

export default DownloadBanner;
