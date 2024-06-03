import React from 'react';
import { useSelector } from 'react-redux';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import { getMemberCardStyles, getMerchantMembershipTierList } from '../../redux/selectors';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const merchantMembershipTierList = useSelector(getMerchantMembershipTierList);

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard} style={memberCardStyles}>
        <h2 className={styles.MemberCardCustomerTierLevelName}>{customerTierLevelName}</h2>
        <div>
          <ul>
            {merchantMembershipTierList.map(merchantMembershipTier => {
              const { name } = merchantMembershipTier;

              return <li>{name}</li>;
            })}
          </ul>
        </div>
        {/* <div>
          <progress />
          <ul>
            {membershipTierList.map(membershipTier => {
              return <li></li>;
            })}
          </ul> */}
        {/* </div> */}
      </div>
    </section>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
