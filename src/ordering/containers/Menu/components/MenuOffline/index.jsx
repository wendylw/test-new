/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HybridHeader from '../../../../../components/HybridHeader';
import * as NativeMethods from '../../../../../utils/native-methods';
import { getSourceUrlFromSessionStorage, isWebview } from '../../../../../common/utils';
import ErrorMenuOffline from '../../../../../images/error-menu-offline.png';
import styles from './MenuOffline.module.scss';

const MenuOffline = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleNavBack = () => {
    const sourceUrl = getSourceUrlFromSessionStorage();
    if (sourceUrl) {
      window.location.href = sourceUrl;
      return;
    }

    if (isWebview()) {
      NativeMethods.goBack();
      return;
    }

    history.goBack();
  };

  return (
    <>
      <HybridHeader
        style={{ border: 'none' }}
        data-heap-name="ordering.need-help.header"
        isPage
        title=""
        navFunc={handleNavBack}
      />

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
