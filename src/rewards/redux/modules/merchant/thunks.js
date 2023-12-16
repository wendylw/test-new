import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMerchantInfo } from './api-request';
import { getMerchantBusiness } from './selectors';

export const fetchMerchantInfo = createAsyncThunk('app/merchant/fetchMerchantInfo', async (_, { getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const result = await getMerchantInfo(business);

  // TODO: remove .data when backend fixed
  return result.data;
});
