import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId } from '../app';
import { getConsumerCustomerInfo } from '../api-request';

export const loadConsumerCustomerInfo = createAsyncThunk(
  'loyalty/customer/loadConsumerCustomerInfo',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const result = await getConsumerCustomerInfo(consumerId);

    return result;
  }
);
