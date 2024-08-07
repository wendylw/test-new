import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { getClient } from '../../../../../common/utils';
import CleverTap from '../../../../../utils/clevertap';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import { getIsProfileFormVisible, getIsClaimedOrderRewardsEnabled } from './redux/selectors';
import { skipProfileButtonClicked, saveProfileButtonClicked } from './redux/thunks';
import MerchantInfo from './components/MerchantInfo';
import RewardsDescription from './components/RewardsDescription';
import OrderRewardsDescription from './components/OrderRewardsDescription';
import MembershipTiersTabs from '../../components/MembershipTiersTabs';
import Footer from './components/Footer';
import JoiningIndicator from './components/JoiningIndicator';
import Profile from '../../../Profile';
import styles from './MembershipForm.module.scss';

const MembershipForm = () => {
  const dispatch = useDispatch();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWebview = useSelector(getIsWebview);
  const isProfileFormVisible = useSelector(getIsProfileFormVisible);
  const isClaimedOrderRewardsEnabled = useSelector(getIsClaimedOrderRewardsEnabled);
  const handleSkipProfileForm = useCallback(() => dispatch(skipProfileButtonClicked()), [dispatch]);
  const handleSaveProfileForm = useCallback(() => dispatch(saveProfileButtonClicked()), [dispatch]);

  useMount(() => {
    CleverTap.pushEvent('Join Membership Page - View Page', {
      'account name': merchantBusiness,
      source: getClient(),
    });
  });

  return (
    <>
      <section className={styles.MembershipFormDescription}>
        <MerchantInfo />
        {isClaimedOrderRewardsEnabled ? <OrderRewardsDescription /> : <RewardsDescription />}
      </section>
      <MembershipTiersTabs />
      <Footer />
      <JoiningIndicator />
      {!isWebview && (
        <Profile show={isProfileFormVisible} onSave={handleSaveProfileForm} onSkip={handleSkipProfileForm} />
      )}
    </>
  );
};

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
