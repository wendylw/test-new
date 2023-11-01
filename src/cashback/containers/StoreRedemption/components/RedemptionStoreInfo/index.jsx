import React from 'react';
import { useSelector } from 'react-redux';
import { ObjectFitImage } from '../../../../../common/components/Image';
import { getStoreLogo, getStoreDisplayTitle, getIsDisplayStoreRedemptionContent } from '../../redux/selectors';
import styles from './RedemptionStoreInfo.module.scss';

const RedemptionStoreInfo = () => {
  // get store logo
  const storeLogo = useSelector(getStoreLogo);
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  // get is display store redemption content
  const isDisplayStoreRedemptionContent = useSelector(getIsDisplayStoreRedemptionContent);

  return (
    <section
      className={`tw-flex ${
        isDisplayStoreRedemptionContent
          ? `${styles.StoreRedemptionContentExist} tw-bg-gray-200`
          : styles.StoreRedemptionContentNoExist
      } tw-flex-col tw-items-center tw-justify-center tw-flex-shrink-0 tw-px-16 sm:tw-px-16px tw-pt-24 sm:tw-pt-24px`}
    >
      {isDisplayStoreRedemptionContent ? (
        <ObjectFitImage className={styles.StoreRedemptionStoreLogo} src={storeLogo} />
      ) : null}
      <h1 className={styles.StoreRedemptionStoreName}>{storeDisplayTitle}</h1>
    </section>
  );
};

RedemptionStoreInfo.displayName = 'StoreInfoBanner';

export default RedemptionStoreInfo;
