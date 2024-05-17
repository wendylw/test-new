import React from 'react';
import { MEMBER_LEVELS } from '../../../../../common/utils/constants';
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
    <MembershipTiersTabs unlockLevel={MEMBER_LEVELS.MEMBER} />
  </>
);

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
