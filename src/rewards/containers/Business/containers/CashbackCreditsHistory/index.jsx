import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLifecycles } from 'react-use';
import { getIsMerchantEnabledStoreCredits } from '../../../../../redux/modules/merchant/selectors';
import { getIsCashbackStoreCreditsHistoryPageShow } from './redux/selectors';
import { actions as CashbackCreditsHistoryActions } from './redux';
import { mounted } from './redux/thunks';
import CashbackHistory from './CashbackHistory';
import StoreCreditsHistory from './StoreCreditsHistory';

const CashbackCreditsHistory = () => {
  const dispatch = useDispatch();
  const isCashbackStoreCreditsHistoryPageShow = useSelector(getIsCashbackStoreCreditsHistoryPageShow);
  const isMerchantEnabledStoreCredits = useSelector(getIsMerchantEnabledStoreCredits);

  useLifecycles(
    async () => {
      await dispatch(mounted());
    },
    () => dispatch(CashbackCreditsHistoryActions.cashbackCreditsHistoryReset())
  );

  if (!isCashbackStoreCreditsHistoryPageShow) {
    return null;
  }

  return isMerchantEnabledStoreCredits ? <StoreCreditsHistory /> : <CashbackHistory />;
};

CashbackCreditsHistory.displayName = 'CashbackCreditsHistoryProxy';

export default CashbackCreditsHistory;
