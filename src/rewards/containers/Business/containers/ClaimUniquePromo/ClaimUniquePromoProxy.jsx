import React from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import ClaimSuccess from './components/ClaimSuccess';
import ClaimUniquePromo from '.';

const ClaimUniquePromoProxy = () => {
  const dispatch = useDispatch();

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader />
      <ClaimUniquePromo />
      <ClaimSuccess />
    </Frame>
  );
};

ClaimUniquePromoProxy.displayName = 'ClaimUniquePromo';

export default ClaimUniquePromoProxy;
