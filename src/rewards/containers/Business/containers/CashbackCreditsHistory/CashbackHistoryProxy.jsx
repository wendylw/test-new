import React from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { getIsMerchantEnabledStoreCredits } from './redux/selectors';
import CashbackHistory from '.';
import StoreCreditsHistory from './StoreCreditsHistory';

const CashbackHistoryProxy = () => {
  const isMerchantEnabledStoreCredits = useSelector(getIsMerchantEnabledStoreCredits);

  useMount(() => {
    dispatch(mounted());
  });

  return isMerchantEnabledStoreCredits ? <StoreCreditsHistory /> : <CashbackHistory />;
};

CashbackHistoryProxy.displayName = 'CashbackHistoryProxy';

export default CashbackHistoryProxy;
