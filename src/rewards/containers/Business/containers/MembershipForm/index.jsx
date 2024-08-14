import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { getClient } from '../../../../../common/utils';
import CleverTap from '../../../../../utils/clevertap';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import { getIsProfileFormVisible, getIsClaimedOrderRewardsEnabled, getLoadOrderRewardsError } from './redux/selectors';
import { actions as membershipFormActions } from './redux';
import { skipProfileButtonClicked, saveProfileButtonClicked } from './redux/thunks';
import MerchantInfo from './components/MerchantInfo';
import RewardsDescription from './components/RewardsDescription';
import OrderRewardsDescription from './components/OrderRewardsDescription';
import MembershipTiersTabs from '../../components/MembershipTiersTabs';
import Footer from './components/Footer';
import JoiningIndicator from './components/JoiningIndicator';
import Profile from '../../../Profile';
import styles from './MembershipForm.module.scss';
import { alert } from '../../../../../common/utils/feedback';

const MembershipForm = () => {
  const dispatch = useDispatch();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWebview = useSelector(getIsWebview);
  const isProfileFormVisible = useSelector(getIsProfileFormVisible);
  const loadOrderRewardsError = useSelector(getLoadOrderRewardsError);
  const isClaimedOrderRewardsEnabled = useSelector(getIsClaimedOrderRewardsEnabled);
  const handleSkipProfileForm = useCallback(() => dispatch(skipProfileButtonClicked()), [dispatch]);
  const handleSaveProfileForm = useCallback(() => dispatch(saveProfileButtonClicked()), [dispatch]);
  const handleResetGetOrderRewardsError = useCallback(
    () => dispatch(membershipFormActions.loadOrderRewardsErrorReset()),
    [dispatch]
  );

  useMount(() => {
    CleverTap.pushEvent('Join Membership Page - View Page', {
      'account name': merchantBusiness,
      source: getClient(),
    });
  });

  useEffect(() => {
    if (loadOrderRewardsError) {
      const { title, description } = loadOrderRewardsError;

      alert(description, {
        title,
        onClose: handleResetGetOrderRewardsError,
      });
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
      {!isWebview && (
        <Profile show={isProfileFormVisible} onSave={handleSaveProfileForm} onSkip={handleSkipProfileForm} />
      )}
    </>
  );
};

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
