import { createAsyncThunk } from '@reduxjs/toolkit';
import { postSharingConsumerInfoToMerchant, getUniquePromoList } from './api-request';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';

export const confirmToShareConsumerInfo = createAsyncThunk(
  'rewards/business/common/confirmToShareConsumerInfo',
  async (requestId, { getState }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const result = await postSharingConsumerInfoToMerchant({ requestId, business: merchantBusiness });

    return result;
  }
);

export const fetchUniquePromoList = createAsyncThunk(
  'rewards/business/memberDetail/fetchPromoList',
  async (consumerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoList({ consumerId, business });

    return result;
  }
);
