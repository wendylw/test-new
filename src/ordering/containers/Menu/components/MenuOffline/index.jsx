/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorMenuOffline from '../../../../../images/error-menu-offline.png';
import styles from './MenuOffline.module.scss';

const MenuOffline = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.menuOfflineContainer}>
        <img src={ErrorMenuOffline} className={styles.menuOfflineImg} />
        <div className={styles.menuOfflineDesc}>
          <p className="tw-text-xl tw-font-bold">{t('StoreNotFound')}</p>
          <p className={styles.menuOfflineDescUnder}>{t('StoreNotFoundDesc')}</p>
        </div>
      </div>
    </>
  );
};

MenuOffline.displayName = 'MenuOffline';

export default MenuOffline;
