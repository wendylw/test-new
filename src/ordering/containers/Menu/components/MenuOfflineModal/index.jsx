/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FullScreenFrame from '../../../../../common/components/FullScreenFrame';
import { getEnableLiveOnline } from '../../redux/common/selectors';
import ErrorMenuOffline from '../../../../../images/error-menu-offline.png';
import styles from './MenuOfflineModal.module.scss';

const MenuOfflineModal = () => {
  const { t } = useTranslation();
  const enableLiveOnline = useSelector(getEnableLiveOnline);

  return (
    <>
      {enableLiveOnline == null
        ? null
        : enableLiveOnline && (
            <FullScreenFrame className={styles.fullScreenGround}>
              <div className={styles.menuOfflineContainer}>
                <img src={ErrorMenuOffline} className={styles.menuOfflineImg} />
                <div className={styles.menuOfflineDesc}>
                  <p className="tw-text-xl tw-font-bold">{t('StoreNotFound')}</p>
                  <p className={styles.menuOfflineDescUnder}>{t('StoreNotFoundDesc')}</p>
                </div>
              </div>
            </FullScreenFrame>
          )}
    </>
  );
};

MenuOfflineModal.displayName = 'MenuOfflineModal';

export default MenuOfflineModal;
