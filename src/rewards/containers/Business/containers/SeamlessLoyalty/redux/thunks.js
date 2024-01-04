import { createAsyncThunk } from '@reduxjs/toolkit';
import { getSeamlessLoyaltyPlatform } from '../utils';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByTngMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { fetchMerchantInfo } from '../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { getIsWebview, getIsTNGMiniProgram } from '../../../../../redux/modules/common/selectors';
import { patchSharingConsumerInfo, postSharingConsumerInfoToMerchant } from './api-request';
import { getSeamlessLoyaltyRequestId, getIsSharingConsumerInfoEnabled } from './selectors';

export const updateSharingConsumerInfo = createAsyncThunk(
  'rewards/business/seamlessLoyalty/updateSharingConsumerInfo',
  async (_, { getState }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const requestId = getSeamlessLoyaltyRequestId(state);
    const source = getSeamlessLoyaltyPlatform();
    const result = await patchSharingConsumerInfo({ requestId, source, business: merchantBusiness });

    return result;
  }
);

export const confirmToShareConsumerInfoRequests = createAsyncThunk(
  'rewards/business/seamlessLoyalty/confirmToShareConsumerInfoRequests',
  async (_, { getState }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const requestId = getSeamlessLoyaltyRequestId(state);
    const result = await postSharingConsumerInfoToMerchant({ requestId, business: merchantBusiness });

    return result;
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/seamlessLoyalty/mounted',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const isWebview = getIsWebview(state);
    const isTNGMiniProgram = getIsTNGMiniProgram(state);

    dispatch(fetchMerchantInfo());
    await dispatch(initUserInfo());

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (isTNGMiniProgram) {
      await dispatch(loginUserByTngMiniProgram());
    }

    const isSharingConsumerInfoEnabled = getIsSharingConsumerInfoEnabled(getState());

    // No need to get Customer data.
    // Completed the Shared Consumer Info request to Merchant,
    // Back-End completed creating customer and member events on the server side.
    if (isSharingConsumerInfoEnabled) {
      await dispatch(updateSharingConsumerInfo());
      await dispatch(confirmToShareConsumerInfoRequests());
    }
  }
);
