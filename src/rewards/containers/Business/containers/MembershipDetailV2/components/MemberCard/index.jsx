import React from 'react';
import { useSelector } from 'react-redux';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const customerTierLevelName = useSelector(getCustomerTierLevelName);

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard}>
        <h2>{customerTierLevelName}</h2>
        {/* <div>
          <progress />
          <ul>
            <li></li>
          </ul>
        </div> */}
      </div>
    </section>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
