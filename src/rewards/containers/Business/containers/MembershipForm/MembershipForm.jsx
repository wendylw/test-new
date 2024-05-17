import React from 'react';
import MerchantInfo from './components/MerchantInfo';
import RewardsDescription from './components/RewardsDescription';
import MembershipTiersTabs from '../../components/MembershipTiersTabs';
import styles from './MembershipForm.module.scss';

const MembershipForm = () => (
  <>
    <section className={styles.MembershipFormDescription}>
      <MerchantInfo />
      <RewardsDescription />
    </section>
    <MembershipTiersTabs />
  </>
);

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
