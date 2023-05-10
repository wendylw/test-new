import React from 'react';
import { useSelector } from 'react-redux';
import { ObjectFitImage } from '../../../../../common/components/Image';
import { getStoreLogo, getStoreDisplayTitle } from '../../redux/selectors';
import '../../../../../common/styles/base.scss';
import styles from './RedemptionStoreInfo.module.scss';

const RedemptionStoreInfo = () => {
  // get store logo
  const storeLogo = useSelector(getStoreLogo);
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);

  return (
    <section className="tw-flex tw-column tw-items-center tw-justify-center tw-gap-y-12 sm:tw-gap-y-12px tw-px-16 sm:tw-px-16px tw-py-24 sm:tw-py-24px tw-bg-gray-200 tw-flex-1">
      <ObjectFitImage className="tw-rounded" src={storeLogo} />
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
