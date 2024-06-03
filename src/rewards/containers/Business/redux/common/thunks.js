import { createAsyncThunk } from '@reduxjs/toolkit';
import { postSharingConsumerInfoToMerchant, getUniquePromoList, getUniquePromoListBanners } from './api-request';
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
  'rewards/business/common/fetchPromoList',
  async (consumerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoList({ consumerId, business });

    return result;
  }
);

export const fetchUniquePromoListBanners = createAsyncThunk(
  'rewards/business/common/fetchUniquePromoListBanners',
  async (consumerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoListBanners({ consumerId, business });

    return result;
  }
);
