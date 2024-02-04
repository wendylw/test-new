import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  CASHBACK_SOURCE,
  CLAIM_CASHBACK_QUERY_NAMES,
  CLAIM_CASHBACK_TYPES,
  PATH_NAME_MAPPING,
  BECOME_MERCHANT_MEMBER_METHODS,
} from '../../../../common/utils/constants';
import { getRegistrationTouchPoint, getRegistrationSource } from '../../../../common/utils';
import { getIsLogin, getUserPhoneNumber } from '../../../../redux/modules/user/selectors';
import { initUserInfo, loginUserByBeepApp, loginUserByAlipayMiniProgram } from '../../../../redux/modules/user/thunks';
import { getMerchantBusiness, getIsMerchantMembershipEnabled } from '../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../redux/modules/merchant/thunks';
import { getIsWebview, getIsAlipayMiniProgram } from '../../../redux/modules/common/selectors';
import { loadConsumerCustomerInfo } from '../../../redux/modules/customer/thunks';
import { getOrderQRReceiptNumber, getOrderCashbackInfo, postClaimedCashbackForCustomer } from './api-request';
import {
  getClaimCashbackPageHash,
  getOrderReceiptNumber,
  getIsPriceCashback,
  getOrderCashbackPrice,
  getOrderCashbackPercentageNumber,
  getClaimedOrderCashbackStatus,
  getIsClaimedCashbackForCustomerFulfilled,
} from './selectors';

export const fetchOrderReceiptNumber = createAsyncThunk(
  'cashback/claimCashback/fetchOrderReceiptNumber',
  async (_, { getState }) => {
    const state = getState();
    const claimCashbackPageHash = getClaimCashbackPageHash(state);
    const result = await getOrderQRReceiptNumber(claimCashbackPageHash);

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

export const claimedCashbackForCustomer = createAsyncThunk(
  'cashback/claimCashback/claimedCashbackForCustomer',
  async (_, { getState }) => {
    const state = getState();
    const receiptNumber = getOrderReceiptNumber(state);
    const userPhoneNumber = getUserPhoneNumber(state);
    const result = await postClaimedCashbackForCustomer({
      receiptNumber,
      phone: userPhoneNumber,
      source: CASHBACK_SOURCE.RECEIPT,
      registrationTouchpoint: getRegistrationTouchPoint(),
      registrationSource: getRegistrationSource(),
    });

    return result;
  }
);

export const claimedCashbackAndContinueNextStep = createAsyncThunk(
  'cashback/claimCashback/claimedCashbackAndContinueNextStep',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const isMerchantMembershipEnabled = getIsMerchantMembershipEnabled(state);
    const isPriceCashback = getIsPriceCashback(state);
    const orderCashbackPrice = getOrderCashbackPrice(state);
    const orderCashbackPercentageNumber = getOrderCashbackPercentageNumber(state);
    const cashbackType = isPriceCashback ? CLAIM_CASHBACK_TYPES.ABSOLUTE : CLAIM_CASHBACK_TYPES.PERCENTAGE;
    const cashback = isPriceCashback ? encodeURIComponent(orderCashbackPrice) : orderCashbackPercentageNumber;

    await dispatch(claimedCashbackForCustomer());

    const isClaimedCashbackForCustomerFulfilled = getIsClaimedCashbackForCustomerFulfilled(getState());

    if (isClaimedCashbackForCustomerFulfilled) {
      // TODO: WB-6669: remove this request new page no needs to request
      dispatch(loadConsumerCustomerInfo());

      const claimedOrderCashbackStatus = getClaimedOrderCashbackStatus(getState());
      const { REWARDS_BASE, REWARDS_BUSINESS, REWARDS_MEMBERSHIP, MEMBERSHIP_DETAIL } = PATH_NAME_MAPPING;
      const rewardsBaseRoute = `${window.location.protocol}//${process.env.REACT_APP_QR_SCAN_DOMAINS}`;
      const pathName = `${REWARDS_BASE}${REWARDS_BUSINESS}${REWARDS_MEMBERSHIP}${MEMBERSHIP_DETAIL}`;
      const search = [
        `business=${merchantBusiness}`,
        `source=${BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN}`,
        `${CLAIM_CASHBACK_QUERY_NAMES.STATUS}=${claimedOrderCashbackStatus}`,
        `${CLAIM_CASHBACK_QUERY_NAMES.TYPE}=${cashbackType}`,
        `${CLAIM_CASHBACK_QUERY_NAMES.VALUE}=${cashback}`,
      ];

      if (isMerchantMembershipEnabled) {
        window.location.href = `${rewardsBaseRoute}${pathName}?${search.join('&')}`;
      }
    }
  }
);

export const mounted = createAsyncThunk('cashback/claimCashback/mounted', async (_, { getState, dispatch }) => {
  const state = getState();
  const merchantBusiness = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);

  dispatch(fetchMerchantInfo(merchantBusiness));
  await dispatch(fetchOrderReceiptNumber());

  const orderReceiptNumber = getOrderReceiptNumber(getState());

  if (orderReceiptNumber) {
    dispatch(fetchOrderCashbackInfo());
  }

  await dispatch(initUserInfo());

  if (isWebview) {
    await dispatch(loginUserByBeepApp());
  }

  if (isAlipayMiniProgram) {
    await dispatch(loginUserByAlipayMiniProgram());
  }

  const isLogin = getIsLogin(getState());

  if (isLogin && orderReceiptNumber) {
    await dispatch(claimedCashbackAndContinueNextStep());
  }
});
