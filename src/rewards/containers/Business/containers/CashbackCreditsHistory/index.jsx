import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import {
  getIsLoadMerchantRequestCompleted,
  getIsMerchantEnabledStoreCredits,
} from '../../../../../redux/modules/merchant/selectors';
import { mounted } from './redux/thunks';
import CashbackHistory from './CashbackHistory';
import StoreCreditsHistory from './StoreCreditsHistory';

const CashbackCreditsHistory = () => {
  const dispatch = useDispatch();
  const isLoadMerchantRequestCompleted = useSelector(getIsLoadMerchantRequestCompleted);
  const isMerchantEnabledStoreCredits = useSelector(getIsMerchantEnabledStoreCredits);

  useMount(async () => {
    await dispatch(mounted());
  });

  if (!isLoadMerchantRequestCompleted) {
    return null;
  }

  return isMerchantEnabledStoreCredits ? <StoreCreditsHistory /> : <CashbackHistory />;
};

CashbackCreditsHistory.displayName = 'CashbackCreditsHistoryProxy';

export default CashbackCreditsHistory;
