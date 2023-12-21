import React from 'react';
import BusinessProfile from './components/BusinessProfile';
import BusinessRewards from './components/BusinessRewards';
import Footer from './components/Footer';
import JoiningIndicator from './components/JoiningIndicator';

const MembershipForm = () => (
  <>
    <section>
      <BusinessProfile />
      <BusinessRewards />
    </section>
    <Footer />
    <JoiningIndicator />
  </>
);

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
