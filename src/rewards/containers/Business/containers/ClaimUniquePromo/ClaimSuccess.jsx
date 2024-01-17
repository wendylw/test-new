import React from 'react';
import UniquePromoCongratulation from './components/UniquePromoCongratulation';
import ClaimUniquePromoFooter from './components/ClaimUniquePromoFooter';

const ClaimSuccess = () => {
  return (
    <>
      <UniquePromoCongratulation />
      <ClaimUniquePromoFooter />
    </>
  );
};

ClaimSuccess.displayName = 'ClaimSuccess';

export default ClaimSuccess;
