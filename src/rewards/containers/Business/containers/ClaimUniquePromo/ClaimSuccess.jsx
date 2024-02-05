import React from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { getClient } from '../../../../../common/utils';
import CleverTap from '../../../../../utils/clevertap';
import { getUserCountry } from '../../../../../redux/modules/user/selectors';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import UniquePromoCongratulation from './components/UniquePromoCongratulation';
import UniquePromCongratulationFooter from './components/UniquePromCongratulationFooter';

const ClaimSuccess = () => {
  const userCountry = useSelector(getUserCountry);
  const merchantBusiness = useSelector(getMerchantBusiness);

  useMount(() => {
    CleverTap.pushEvent('Claim Unique Promo Landing Page - Claim Unique Promo Successful', {
      country: userCountry,
      'account name': merchantBusiness,
      source: getClient(),
    });
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
