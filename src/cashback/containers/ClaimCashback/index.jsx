import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount, useUnmount } from 'react-use';
import { getIsUserLogin } from '../../redux/modules/app';
import { actions as claimActions, getReceiptNumber, getCashbackClaimRequestStatus } from '../../redux/modules/claim';
import Frame from '../../../common/components/Frame';
import PageHeader from '../../../common/components/PageHeader';
import MerchantInfo from './components/MerchantInfo';
import CashbackBlock from './components/CashbackBlock';

const ClaimCashback = () => {
  const dispatch = useDispatch();
  const isUserLogin = useSelector(getIsUserLogin);
  const receiptNumber = useSelector(getReceiptNumber);
  const claimRequestStatus = useSelector(getCashbackClaimRequestStatus);

  useMount(() => {
    dispatch(claimActions.mounted());
  });

  useUnmount(() => {
    dispatch(claimActions.resetData());
  });

  useEffect(() => {
    if (isUserLogin && receiptNumber && !claimRequestStatus) {
      dispatch(claimActions.claimCashbackForConsumer(receiptNumber));
    }
  }, [isUserLogin, claimRequestStatus, receiptNumber, dispatch]);

  return (
    <Frame>
      <PageHeader />
      <MerchantInfo />
      <CashbackBlock />
    </Frame>
  );
};

ClaimCashback.displayName = 'ClaimCashback';

export default ClaimCashback;
