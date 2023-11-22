import React from 'react';
import BusinessProfile from './components/BusinessProfile';
import BusinessRewards from './components/BusinessRewards';
import Footer from './components/Footer';

const MembershipForm = () => (
  <>
    <section>
      <BusinessProfile />
      <BusinessRewards />
    </section>
    <Footer />
  </>
);

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
