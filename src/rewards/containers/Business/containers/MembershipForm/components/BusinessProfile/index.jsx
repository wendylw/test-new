import React from 'react';
import { useSelector } from 'react-redux';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import { getBusinessLogo, getBusinessName } from '../../redux/selectors';
import BeepLogo from '../../../../../../../images/beep-logo.png';
import styles from './BusinessProfile.module.scss';

const BusinessProfile = () => {
  const businessLogo = useSelector(getBusinessLogo);
  const businessName = useSelector(getBusinessName);

  return (
    <div className={styles.businessProfile}>
      <div className={`${styles.businessProfileLogo} tw-relative tw-flex-shrink-0`}>
        <ObjectFitImage className="tw-rounded" src={businessLogo || BeepLogo} noCompression />
      </div>
      <h3 className={styles.businessProfileName}>{businessName}</h3>
    </div>
  );
};

BusinessProfile.displayName = 'BusinessProfile';

export default BusinessProfile;
