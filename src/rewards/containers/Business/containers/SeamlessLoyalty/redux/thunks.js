import { createAsyncThunk } from '@reduxjs/toolkit';
import { getSeamlessLoyaltyPlatform } from '../utils';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { getIsWebview, getIsAlipayMiniProgram } from '../../../../../redux/modules/common/selectors';
import { confirmToShareConsumerInfo } from '../../../redux/common/thunks';
import { patchSharingConsumerInfo } from './api-request';
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

export const mounted = createAsyncThunk(
  'rewards/business/seamlessLoyalty/mounted',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const merchantBusiness = getMerchantBusiness(state);
    const requestId = getSeamlessLoyaltyRequestId(state);

    dispatch(fetchMerchantInfo(merchantBusiness));
    await dispatch(initUserInfo());

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (isAlipayMiniProgram) {
      await dispatch(loginUserByAlipayMiniProgram());
    }

    const isSharingConsumerInfoEnabled = getIsSharingConsumerInfoEnabled(getState());

    // No need to get Customer data.
    // Completed the Shared Consumer Info request to Merchant,
    // Back-End completed creating customer and member events on the server side.
    if (isSharingConsumerInfoEnabled) {
      await dispatch(updateSharingConsumerInfo());
      await dispatch(confirmToShareConsumerInfo(requestId));
    }
  }
);
