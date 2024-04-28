import React from 'react';
import { useSelector } from 'react-redux';
import { ObjectFitImage } from '../../../../../common/components/Image';
import { getMerchantLogo, getMerchantDisplayName } from '../../../../../redux/modules/merchant/selectors';
import { getIsMerchantLogoShown } from '../../redux/selectors';
import styles from './RedemptionStoreInfo.module.scss';

const RedemptionStoreInfo = () => {
  const merchantLogo = useSelector(getMerchantLogo);
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const isMerchantLogoShown = useSelector(getIsMerchantLogoShown);

  return (
    <section
      className={`tw-flex ${
        !isMerchantLogoShown
          ? styles.StoreRedemptionContentExist
          : `${styles.StoreRedemptionContentNoExist} tw-bg-gray-200`
      } tw-flex-col tw-items-center tw-justify-center tw-flex-shrink-0 tw-px-16 sm:tw-px-16px tw-pt-24 sm:tw-pt-24px`}
    >
      {isMerchantLogoShown ? <ObjectFitImage className={styles.StoreRedemptionStoreLogo} src={merchantLogo} /> : null}
      <h1 className={styles.StoreRedemptionStoreName}>{merchantDisplayName}</h1>
    </section>
  );
};

RedemptionStoreInfo.displayName = 'StoreInfoBanner';

export default RedemptionStoreInfo;
