import React from 'react';
import UniquePromoCongratulation from './components/UniquePromoCongratulation';
import UniquePromCongratulationFooter from './components/UniquePromCongratulationFooter';

const ClaimSuccess = () => {
  return (
    <>
      <UniquePromoCongratulation />
      <UniquePromCongratulationFooter />
    </>
  );
};

ClaimSuccess.displayName = 'ClaimSuccess';

export default ClaimSuccess;
