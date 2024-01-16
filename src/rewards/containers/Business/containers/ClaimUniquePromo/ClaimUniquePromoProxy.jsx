import React from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { initUserInfo } from '../../../../../redux/modules/user/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';

const ClaimUniquePromoProxy = () => {
  const dispatch = useDispatch();

  useMount(async () => {
    await dispatch(initUserInfo());
  });

  return (
    <Frame>
      <PageHeader />
    </Frame>
  );
};

ClaimUniquePromoProxy.displayName = 'ClaimUniquePromo';

export default ClaimUniquePromoProxy;
