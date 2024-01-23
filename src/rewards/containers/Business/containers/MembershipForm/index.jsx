import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BusinessProfile from './components/BusinessProfile';
import BusinessRewards from './components/BusinessRewards';
import Footer from './components/Footer';
import JoiningIndicator from './components/JoiningIndicator';
import Profile from '../../../Profile';
import { getIsProfileFormVisible } from './redux/selectors';
import { skipProfileButtonClicked, saveProfileButtonClicked } from './redux/thunks';

const MembershipForm = () => {
  const dispatch = useDispatch();
  const isProfileFormVisible = useSelector(getIsProfileFormVisible);
  const handleSkipProfileForm = useCallback(() => dispatch(skipProfileButtonClicked()), [dispatch]);
  const handleSaveProfileForm = useCallback(() => dispatch(saveProfileButtonClicked()), [dispatch]);

  return (
    <>
      <section>
        <BusinessProfile />
        <BusinessRewards />
      </section>
      <Footer />
      <JoiningIndicator />
      <Profile show={isProfileFormVisible} onSave={handleSaveProfileForm} onSkip={handleSkipProfileForm} />
    </>
  );
};

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
