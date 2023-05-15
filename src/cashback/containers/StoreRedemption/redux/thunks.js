import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions } from '../../../redux/modules/app';
import { patchShareConsumerInfoRequests, postShareConsumerInfoRequests } from './api-request';
import { getStoreRedemptionRequestId } from './selectors';
import { getCookieVariable } from '../../../../common/utils';
import { getStoreRedemptionPlatform } from '../utils';
import logger from '../../../../utils/monitoring/logger';

export const updateShareConsumerInfoRequests = createAsyncThunk(
  'loyalty/storeRedemption/updateShareConsumerInfoRequests',
  async (_, { getState }) => {
    const state = getState();
    const requestId = getStoreRedemptionRequestId(state);
    const source = getStoreRedemptionPlatform();

    try {
      const result = await patchShareConsumerInfoRequests(requestId, { source });

      return result;
    } catch (error) {
      logger.error('Loyalty_StoreRedemption_updateShareConsumerInfoRequestsFailed', { message: error?.message });

      throw error;
    }
  }
);

export const confirmToShareConsumerInfoRequests = createAsyncThunk(
  'loyalty/storeRedemption/confirmToShareConsumerInfoRequests',
  async (_, { getState }) => {
    const state = getState();
    const requestId = getStoreRedemptionRequestId(state);

    try {
      const result = await postShareConsumerInfoRequests(requestId);

      return result;
    } catch (error) {
      logger.error('Loyalty_StoreRedemption_confirmToShareConsumerInfoRequestsFailed', { message: error?.message });

      throw error;
    }
  }
);

export const updateStoreRedemptionRequestId = createAsyncThunk(
  'loyalty/storeRedemption/updateStoreRedemptionRequestId',
  async () => {
    try {
      const requestId = getCookieVariable('__sh_rdm_reqId');

      console.log(requestId);

      return requestId;
    } catch (error) {
      logger.error('Loyalty_StoreRedemption_updateStoreRedemptionRequestIdFailed', { message: error?.message });

      throw error;
    }
  }
);

export const mounted = createAsyncThunk('loyalty/storeRedemption/mounted', async (_, { dispatch, getState }) => {
  try {
    await dispatch(updateStoreRedemptionRequestId());
    await dispatch(appActions.loadCoreBusiness());

    const requestId = getStoreRedemptionRequestId(getState());

    console.log(requestId);

    if (requestId) {
      await dispatch(updateShareConsumerInfoRequests());
      dispatch(confirmToShareConsumerInfoRequests());
    }
  } catch (error) {
    logger.error('Loyalty_StoreRedemption_mountedFailed', { message: error?.message });

    throw error;
  }
});
