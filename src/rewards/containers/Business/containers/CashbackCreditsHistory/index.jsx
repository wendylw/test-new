import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { getIsMerchantEnabledStoreCredits } from '../../../../../redux/modules/merchant/selectors';
import { mounted } from './redux/thunks';
import CashbackHistory from './CashbackHistory';
import StoreCreditsHistory from './StoreCreditsHistory';

const CashbackCreditsHistory = () => {
  const dispatch = useDispatch();
  const isMerchantEnabledStoreCredits = useSelector(getIsMerchantEnabledStoreCredits);

  useMount(async () => {
    await dispatch(mounted());
  });

  return isMerchantEnabledStoreCredits ? <StoreCreditsHistory /> : <CashbackHistory />;
};

CashbackCreditsHistory.displayName = 'CashbackCreditsHistoryProxy';

export default CashbackCreditsHistory;
