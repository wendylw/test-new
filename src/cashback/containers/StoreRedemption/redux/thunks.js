import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCookieVariable } from '../../../../common/utils';
import { getStoreRedemptionPlatform } from '../utils';
import CleverTap from '../../../../utils/clevertap';
import logger from '../../../../utils/monitoring/logger';
import { patchShareConsumerInfoRequests, postShareConsumerInfoRequests } from './api-request';
import { getIsLogin, getUserCountry } from '../../../../redux/modules/user/selectors';
import { initUserInfo, loginUserByBeepApp, loginUserByAlipayMiniProgram } from '../../../../redux/modules/user/thunks';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../redux/modules/merchant/thunks';
import { getIsWebview, getIsAlipayMiniProgram } from '../../../redux/modules/common/selectors';
import { getCustomerCashback } from '../../../redux/modules/customer/selectors';
import { loadConsumerCustomerInfo } from '../../../redux/modules/customer/thunks';
import { getStoreRedemptionRequestId, getIsStoreRedemptionNewCustomer } from './selectors';

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

      return requestId;
    } catch (error) {
      logger.error('Loyalty_StoreRedemption_updateStoreRedemptionRequestIdFailed', { message: error?.message });

      throw error;
    }
  }
);

export const mounted = createAsyncThunk('loyalty/storeRedemption/mounted', async (_, { dispatch, getState }) => {
  try {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);

    dispatch(fetchMerchantInfo(merchantBusiness));
    await dispatch(updateStoreRedemptionRequestId());

    const requestId = getStoreRedemptionRequestId(getState());

    if (requestId) {
      await dispatch(updateShareConsumerInfoRequests());
    }

    await dispatch(initUserInfo());

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (isAlipayMiniProgram) {
      await dispatch(loginUserByAlipayMiniProgram());
    }

    const isLogin = getIsLogin(getState());

    if (isLogin) {
      await dispatch(confirmToShareConsumerInfoRequests());
      await dispatch(loadConsumerCustomerInfo());

      const customerCashback = getCustomerCashback(getState());
      const userCountry = getUserCountry(getState());
      const isStoreRedemptionNewCustomer = getIsStoreRedemptionNewCustomer(getState());

      CleverTap.pushEvent('POS Redemption Landing Page - View Page', {
        country: userCountry,
        page:
          customerCashback > 0
            ? 'With Cashback'
            : `Without Cashback (${isStoreRedemptionNewCustomer ? 'New' : 'Returning'} Customer)`,
      });
    }
  } catch (error) {
    logger.error('Loyalty_StoreRedemption_mountedFailed', { message: error?.message });

    throw error;
  }
});
