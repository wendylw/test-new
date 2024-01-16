import React from 'react';
import beepAppAppleStore from '../../../images/beep-app-apple-store.svg';
import beepAppGooglePlay from '../../../images/beep-app-google-play.svg';
import { judgeClient, getIsDesktopClients } from '../../../common/utils';
import { ObjectFitImage } from '../Image';
import styles from './DownloadBanner.module.scss';

const DownloadBanner = ({ link = '', text = '' }) => {
  const isDesktopClient = getIsDesktopClients(judgeClient());

  return (
    <a className={styles.DownloadBanner} href={link} rel="noreferrer" target={isDesktopClient ? '_blank' : ''}>
      <span>{text}</span>
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

export default DownloadBanner;
