/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorMenuOffline from '../../../../../images/error-menu-offline.png';
import styles from './MenuOffline.module.scss';

const MenuOffline = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.menuOfflineContainer}>
      <img src={ErrorMenuOffline} className={styles.menuOfflineImg} />
      <p className="ordering-submission__pending-description margin-top-bottom-normal text-center text-size-big text-line-height-base">
        Oops! Store not found
      </p>
      <p>The store could be undergoing an upgrade or is offline at the moment</p>
    </div>
  );
};

MenuOffline.displayName = 'MenuOffline';

export default MenuOffline;
