import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { getClient } from '../../../../../common/utils';
import CleverTap from '../../../../../utils/clevertap';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import BusinessProfile from './components/BusinessProfile';
import BusinessRewards from './components/BusinessRewards';
import Footer from './components/Footer';
import JoiningIndicator from './components/JoiningIndicator';
import Profile from '../../../Profile';
import { getIsProfileFormVisible } from './redux/selectors';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import { skipProfileButtonClicked, saveProfileButtonClicked } from './redux/thunks';

const MembershipForm = () => {
  const dispatch = useDispatch();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWebview = useSelector(getIsWebview);
  const isProfileFormVisible = useSelector(getIsProfileFormVisible);
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
      <section>
        <BusinessProfile />
        <BusinessRewards />
      </section>
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
