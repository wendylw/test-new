import React from 'react';
import CompleteProfileImage from '../../../../../images/complete-profile.svg';
import { ObjectFitImage } from '../../../../../common/components/Image';

const HeroSection = () => {
  return (
    <section>
      <h2>Complete your Profile</h2>
      <ObjectFitImage noCompression src={CompleteProfileImage} alt="StoreHub Complete Profile" />
      <div>
        <p>Unlock more rewards and special offers by completing your profile.</p>
      </div>
    </section>
  );
};
