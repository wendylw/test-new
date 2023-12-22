import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions } from '../../../redux/modules/app';
import { patchSharingConsumerInfo, postSharingConsumerInfoToMerchant } from './api-request';
import { getStoreRedemptionRequestId } from './selectors';
import { getCookieVariable } from '../../../../common/utils';
import { getStoreRedemptionPlatform } from '../utils';
import logger from '../../../../utils/monitoring/logger';

export const updateSharingConsumerInfo = createAsyncThunk(
  'rewards/business/seamlessLoyalty/updateSharingConsumerInfo',
  async (_, { getState }) => {
    const state = getState();
    const requestId = getSeamlessLoyaltyRequestId(state);
    const source = getSeamlessLoyaltyPlatform();
    const result = await patchSharingConsumerInfo(requestId, { source });

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
  const search = getLocationSearch(state);

  await dispatch(initUserInfo());

  const isLogin = getIsLogin(getState());

  if (isWebview) {
    await dispatch(loginUserByBeepApp());
  }

  if (isTNGMiniProgram) {
    await dispatch(loginUserByTngMiniProgram());
  }

  await dispatch(appActions.loadCoreBusiness());

  const requestId = getStoreRedemptionRequestId(getState());

  if (requestId) {
    await dispatch(updateShareConsumerInfoRequests());
  }
});
