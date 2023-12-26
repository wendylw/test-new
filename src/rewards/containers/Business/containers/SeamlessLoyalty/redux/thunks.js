import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByTngMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getSeamlessLoyaltyPlatform } from '../utils';
import { fetchMerchantInfo } from '../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { patchSharingConsumerInfo, postSharingConsumerInfoToMerchant } from './api-request';
import { getSeamlessLoyaltyRequestId } from './selectors';

export const updateSharingConsumerInfo = createAsyncThunk(
  'rewards/business/seamlessLoyalty/updateSharingConsumerInfo',
  async (_, { getState }) => {
    const state = getState();
    const requestId = getSeamlessLoyaltyRequestId(state);
    const source = getSeamlessLoyaltyPlatform();
    const result = await patchSharingConsumerInfo({ requestId, source });

    return result;
  }
);

export const confirmToShareConsumerInfoRequests = createAsyncThunk(
  'rewards/business/seamlessLoyalty/confirmToShareConsumerInfoRequests',
  async (_, { getState }) => {
    const state = getState();
    const requestId = getStoreRedemptionRequestId(state);
    const result = await postSharingConsumerInfoToMerchant(requestId);

    return result;
  }
);

export const mounted = createAsyncThunk('loyalty/storeRedemption/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isTNGMiniProgram = getIsTNGMiniProgram(state);

  await dispatch(initUserInfo());

  if (isWebview) {
    await dispatch(loginUserByBeepApp());
  }

  if (isTNGMiniProgram) {
    await dispatch(loginUserByTngMiniProgram());
  }

  const isLogin = getIsLogin(getState());
  const requestId = getStoreRedemptionRequestId(getState());

  if (isLogin) {
    if (requestId) {
      await dispatch(updateShareConsumerInfoRequests());
      await dispatch(confirmToShareConsumerInfoRequests());
    }

    dispatch(fetchMerchantInfo());
    dispatch(fetchCustomerInfo(business));
  }
});
