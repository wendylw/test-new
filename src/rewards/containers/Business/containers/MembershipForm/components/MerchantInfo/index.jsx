import React from 'react';
import { useSelector } from 'react-redux';
import { getMerchantLogo, getMerchantDisplayName } from '../../../../../../../redux/modules/merchant/selectors';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MerchantInfo.module.scss';

const MerchantInfo = () => {
  const merchantLogo = useSelector(getMerchantLogo);
  const merchantDisplayName = useSelector(getMerchantDisplayName);

  return (
    <div className={styles.MerchantInfo}>
      {merchantLogo ? (
        <div className={styles.MerchantInfoLogoContainer}>
          <ObjectFitImage className={styles.MerchantInfoLogo} src={merchantLogo} />
        </div>
      ) : null}

      <h1 className={styles.MerchantInfoName}>{merchantDisplayName}</h1>
    </div>
  );
};

MerchantInfo.displayName = 'MerchantInfo';

export default MerchantInfo;
