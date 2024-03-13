import React from 'react';
import { useSelector } from 'react-redux';
import { getMerchantLogo, getMerchantDisplayName } from '../../../../../redux/modules/merchant/selectors';
import { getOrderCashbackStoreCity } from '../../redux/selectors';
import { ObjectFitImage } from '../../../../../common/components/Image';
import styles from './MerchantInfo.module.scss';

const MerchantInfo = () => {
  const merchantLogo = useSelector(getMerchantLogo);
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const city = useSelector(getOrderCashbackStoreCity);

  return (
    <section className={styles.MerchantInfo}>
      {merchantLogo && (
        <div className={styles.MerchantInfoLogoContainer}>
          <ObjectFitImage className="tw-rounded" src={merchantLogo} />
        </div>
      )}

      <h1 className={styles.MerchantInfoTitle}>
        {merchantDisplayName}
        {city ? `, ${city}` : ''}
      </h1>
    </section>
  );
};

MerchantInfo.displayName = 'MerchantInfo';

export default MerchantInfo;
