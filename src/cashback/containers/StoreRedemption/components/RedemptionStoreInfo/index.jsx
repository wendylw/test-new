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
          ? styles.StoreRedemptionContentExist
          : `${styles.StoreRedemptionContentNoExist} tw-flex-1`
      } tw-flex-col tw-items-center tw-justify-center tw-flex-shrink-0 tw-gap-y-12 sm:tw-gap-y-12px tw-px-16 sm:tw-px-16px tw-pt-24 sm:tw-pt-24px tw-bg-gray-200`}
    >
      <ObjectFitImage className={`${styles.StoreRedemptionStoreLogo} tw-rounded`} src={storeLogo} />
      <h1
        className={`${styles.StoreRedemptionStoreName} tw-flex tw-items-center tw-text-xl tw-my-0 tw-leading-relaxed`}
      >
        {storeDisplayTitle}
      </h1>
    </section>
  );
};

RedemptionStoreInfo.displayName = 'StoreInfoBanner';

export default RedemptionStoreInfo;
