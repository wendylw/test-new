import React from 'react';
import { useSelector } from 'react-redux';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import { getMerchantLogo, getMerchantDisplayName } from '../../../../../../../redux/modules/merchant/selectors';
import BeepLogo from '../../../../../../../images/beep-logo.png';
import styles from './BusinessProfile.module.scss';

const BusinessProfile = () => {
  const merchantLogo = useSelector(getMerchantLogo);
  const merchantDisplayName = useSelector(getMerchantDisplayName);

  return (
    <div className={styles.businessProfile}>
      <div className={`${styles.businessProfileLogo} tw-relative tw-flex-shrink-0`}>
        <ObjectFitImage className="tw-rounded" src={merchantLogo || BeepLogo} noCompression />
      </div>
      <h3 className={styles.businessProfileName}>{merchantDisplayName}</h3>
    </div>
  );
};

BusinessProfile.displayName = 'BusinessProfile';

export default BusinessProfile;
