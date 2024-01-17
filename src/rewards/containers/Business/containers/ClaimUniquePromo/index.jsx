import React from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { initUserInfo } from '../../../../../redux/modules/user/thunks';
import ClaimUniquePromoFooter from './components/ClaimUniquePromoFooter';

const ClaimUniquePromo = () => {
  const dispatch = useDispatch();

  useMount(async () => {
    await dispatch(initUserInfo());
  });

  return <ClaimUniquePromoFooter />;
};

ClaimUniquePromo.displayName = 'ClaimUniquePromo';

export default ClaimUniquePromo;
