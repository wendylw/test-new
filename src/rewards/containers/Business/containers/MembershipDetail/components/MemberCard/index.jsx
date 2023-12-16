import React from 'react';
import { useSelector } from 'react-redux';
import MembershipLevelIcon from '../../../../../../../images/membership-level.svg';
import { getMerchantDisplayName } from '../../../../../../redux/modules/merchant/selectors';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const customerTierLevelName = useSelector(getCustomerTierLevelName);

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard}>
        <h1 className={styles.MemberCardStoreName}>{merchantDisplayName}</h1>
        <div className={styles.MemberCardLevelContainer}>
          <span className={styles.MemberCardLevelName}>{customerTierLevelName}</span>
          <div className={styles.MemberCardLevelIcon}>
            <ObjectFitImage
              noCompression
              className={styles.MemberCardLevelIcon}
              src={MembershipLevelIcon}
              alt="Store Membership Level Icon in StoreHub"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
