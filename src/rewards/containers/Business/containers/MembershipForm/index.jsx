import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { WarningCircle } from 'phosphor-react';
import { getClient } from '../../../../../common/utils';
import CleverTap from '../../../../../utils/clevertap';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import { claimOrderRewards } from '../../redux/common/thunks';
import {
  getIsProfileFormVisible,
  getIsClaimedOrderRewardsEnabled,
  getLoadOrderRewardsError,
  getShouldClaimOrderRewards,
} from './redux/selectors';
import { actions as membershipFormActions } from './redux';
import { skipProfileButtonClicked, saveProfileButtonClicked } from './redux/thunks';
import { alert } from '../../../../../common/utils/feedback';
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
  const loadOrderRewardsError = useSelector(getLoadOrderRewardsError);
  const isClaimedOrderRewardsEnabled = useSelector(getIsClaimedOrderRewardsEnabled);
  const shouldClaimOrderRewards = useSelector(getShouldClaimOrderRewards);
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
    if (shouldClaimOrderRewards) {
      dispatch(claimOrderRewards());
    }
  }, [dispatch, shouldClaimOrderRewards]);

  useEffect(() => {
    if (loadOrderRewardsError) {
      const { title, description } = loadOrderRewardsError;

      alert(
        <div className={styles.MembershipFormErrorAlertContent}>
          <WarningCircle className={styles.MembershipFormErrorAlertIcon} size={80} weight="fill" />
          <h4 className={styles.MembershipFormErrorAlertTitle}>{title}</h4>
          {description && <p>{description}</p>}
        </div>,
        {
          customizeContent: true,
          onClose: handleResetGetOrderRewardsError,
        }
      );
    }
  }, [loadOrderRewardsError, handleResetGetOrderRewardsError]);

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
