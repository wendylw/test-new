import { createAsyncThunk } from '@reduxjs/toolkit';
import { postSharingConsumerInfoToMerchant } from './api-request';
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
