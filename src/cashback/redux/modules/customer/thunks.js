import { createAsyncThunk } from '@reduxjs/toolkit';
import logger from '../../../../utils/monitoring/logger';
import { getUserConsumerId } from '../app';
import { getConsumerCustomerInfo } from '../api-request';

export const loadConsumerCustomerInfo = createAsyncThunk(
  'loyalty/customer/loadConsumerCustomerInfo',
  async (_, { getState }) => {
    try {
      const state = getState();
      const consumerId = getUserConsumerId(state);
      const result = await getConsumerCustomerInfo(consumerId);

      return result;
    } catch (error) {
      throw error;
    }
  }
);
