import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMerchantInfo } from './api-request';

export const fetchMerchantInfo = createAsyncThunk('app/merchant/fetchMerchantInfo', async business => {
  const result = await getMerchantInfo(business);

  return result.data;
});
