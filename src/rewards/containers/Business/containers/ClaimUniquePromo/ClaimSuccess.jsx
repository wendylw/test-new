import React from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import CleverTap from '../../../../../utils/clevertap';
import { getUserCountry } from '../../../../../redux/modules/user/selectors';
import UniquePromoCongratulation from './components/UniquePromoCongratulation';
import UniquePromCongratulationFooter from './components/UniquePromCongratulationFooter';

const ClaimSuccess = () => {
  const userCountry = useSelector(getUserCountry);

  useMount(() => {
    CleverTap.pushEvent('Claim Unique Promo Landing Page - Claim Unique Promo Successful', { country: userCountry });
  });

  return (
    <>
      <UniquePromoCongratulation />
      <UniquePromCongratulationFooter />
    </>
  );
};

ClaimSuccess.displayName = 'ClaimSuccess';

export default ClaimSuccess;
