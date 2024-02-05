import React from 'react';
import { useSelector } from 'react-redux';
import { getMerchantLogo, getMerchantDisplayName } from '../../../../../../../redux/modules/merchant/selectors';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MerchantInfo.module.scss';

const MerchantInfo = () => {
  const merchantLogo = useSelector(getMerchantLogo);
  const merchantDisplayName = useSelector(getMerchantDisplayName);

  return (
    <section className={styles.MerchantInfo}>
      <div className={styles.MerchantInfoLogoContainer}>
        <ObjectFitImage noCompression src={merchantLogo} alt="Store Logo in StoreHub" />
      </div>
      <h1 className={styles.MemberInfoStoreName}>{merchantDisplayName}</h1>
    </section>
  );
};

MerchantInfo.displayName = 'MerchantInfo';

export default MerchantInfo;
