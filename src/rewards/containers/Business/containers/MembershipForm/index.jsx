import React from 'react';
import PropTypes from 'prop-types';
import BusinessProfile from './components/BusinessProfile';
import BusinessRewards from './components/BusinessRewards';
import Footer from './components/Footer';

const MembershipForm = ({ onJoinButtonClick }) => (
  <>
    <section>
      <BusinessProfile />
      <BusinessRewards />
    </section>
    <Footer onButtonClick={onJoinButtonClick} />
  </>
);

MembershipForm.displayName = 'MembershipForm';

MembershipForm.propTypes = {
  onJoinButtonClick: PropTypes.func,
};

MembershipForm.defaultProps = {
  onJoinButtonClick: () => {},
};

export default MembershipForm;
