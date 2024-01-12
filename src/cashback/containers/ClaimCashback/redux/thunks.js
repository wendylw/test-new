import { createAsyncThunk } from '@reduxjs/toolkit';
import { CASHBACK_SOURCE } from '../../../../common/utils/constants';
import Utils from '../../../../utils/utils';
import { getUserPhoneNumber } from '../../../../redux/modules/user/selectors';
import { getOrderReceiptNumber, getOrderCashbackInfo } from './api-request';
import { getClaimCashbackPageHash } from './selectors';

export const fetchOrderReceiptNumber = createAsyncThunk(
  'cashback/claimCashback/fetchOrderReceiptNumber',
  async (_, { getState }) => {
    const state = getState();
    const claimCashbackPageHash = getClaimCashbackPageHash(state);
    const result = await getOrderReceiptNumber(claimCashbackPageHash);

    return result;
  }
);

export const fetchOrderCashbackInfo = createAsyncThunk(
  'cashback/claimCashback/fetchOrderCashbackInfo',
  async (_, { getState }) => {
    const state = getState();
    const receiptNumber = getOrderReceiptNumber(state);
    const result = await getOrderCashbackInfo({ receiptNumber, source: CASHBACK_SOURCE.RECEIPT });

    return result;
  }
);

export const createClaimedCashbackForCustomer = createAsyncThunk(
  'cashback/claimCashback/createClaimedCashbackForCustomer',
  async () => {
    const state = getState();
    const receiptNumber = getOrderReceiptNumber(state);
    const userPhoneNumber = getUserPhoneNumber(state);
    const result = await getOrderCashbackInfo({
      receiptNumber,
      phone: userPhoneNumber,
      source: CASHBACK_SOURCE.RECEIPT,
      registrationTouchpoint: Utils.getRegistrationTouchPoint(),
      registrationSource: Utils.getRegistrationSource(),
    });

    return result;
  }
);

export const mounted = createAsyncThunk('cashback/claimCashback/mounted', async (_, { getState, dispatch }) => {
  // TODO: fetch merchant
  // TODO: logined intialize user and profile
  await dispatch(fetchOrderReceiptNumber());

  const orderReceiptNumber = getOrderReceiptNumber(getState());

  if (orderReceiptNumber) {
    await dispatch(fetchOrderCashbackInfo());
  }
});
