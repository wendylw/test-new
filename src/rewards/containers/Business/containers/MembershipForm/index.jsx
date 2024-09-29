import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { WarningCircle } from 'phosphor-react';
import CleverTap from '../../../../../utils/clevertap';
import { getIsClaimedOrderRewardsEnabled } from '../../redux/common/selectors';
import { getIsProfileFormVisible, getLoadOrderRewardsError } from './redux/selectors';
import { joinBusinessMembership, hideWebProfileForm } from './redux/thunks';
import { alert } from '../../../../../common/utils/feedback';
import MerchantInfo from './components/MerchantInfo';
import RewardsDescription from './components/RewardsDescription';
import OrderRewardsDescription from './components/OrderRewardsDescription';
import MembershipTiersTabs from '../../components/MembershipTiersTabs';
import Footer from './components/Footer';
import JoiningIndicator from './components/JoiningIndicator';
import CompleteProfile from '../../../CompleteProfile';
import styles from './MembershipForm.module.scss';

const MembershipForm = () => {
  const dispatch = useDispatch();
  const isProfileFormVisible = useSelector(getIsProfileFormVisible);
  const loadOrderRewardsError = useSelector(getLoadOrderRewardsError);
  const isClaimedOrderRewardsEnabled = useSelector(getIsClaimedOrderRewardsEnabled);
  const handleSkipProfileForm = useCallback(() => dispatch(joinBusinessMembership()), [dispatch]);
  const handleSaveProfileForm = useCallback(() => dispatch(joinBusinessMembership()), [dispatch]);
  const handleCloseProfileForm = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);

  useMount(() => {
    CleverTap.pushEvent('Join Membership Page - View Page');
  });

  useEffect(() => {
    if (loadOrderRewardsError) {
      const { title, description } = loadOrderRewardsError;

      alert(
        <div className={styles.MembershipFormErrorAlertContent}>
          <WarningCircle className={styles.MembershipFormErrorAlertIcon} size={80} weight="fill" />
          <h4 className={styles.MembershipFormErrorAlertTitle}>{title}</h4>
          {description && <p>{description}</p>}
        </div>,
        { customizeContent: true }
      );
    }
  }, [loadOrderRewardsError]);

  return (
    <>
      <section className={styles.MembershipFormDescription}>
        <MerchantInfo />
        {isClaimedOrderRewardsEnabled ? <OrderRewardsDescription /> : <RewardsDescription />}
      </section>
      <MembershipTiersTabs />
      <Footer />
      <JoiningIndicator />
      <CompleteProfile
        isCompleteBirthdayFirst
        show={isProfileFormVisible}
        onSave={handleSaveProfileForm}
        onSkip={handleSkipProfileForm}
        onClose={handleCloseProfileForm}
      />
    </>
  );
};

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
