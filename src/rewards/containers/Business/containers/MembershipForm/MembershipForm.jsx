import React from 'react';
import MerchantInfo from './components/MerchantInfo';
import styles from './MembershipForm.module.scss';

const MembershipForm = () => (
  <section className={styles.MembershipFormDescription}>
    <MerchantInfo />
  </section>
);

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
