import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConsumerCustomerInfo } from './api-request';

export const loadConsumerCustomerInfo = createAsyncThunk(
  'loyalty/customer/loadConsumerCustomerInfo',
  async consumerId => {
    const result = await getConsumerCustomerInfo(consumerId);

    return result;
  }
);
