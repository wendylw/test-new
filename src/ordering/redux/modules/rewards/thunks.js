import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId, getBusiness, getApiRequestShippingType } from '../app';
import { getUniquePromosAvailableCount } from './api-request';

export const fetchUniquePromosAvailableCount = createAsyncThunk(
  'ordering/rewards/fetchUniquePromosAvailableCount',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const business = getBusiness(state);
    const shippingType = getApiRequestShippingType(state);

    const result = await getUniquePromosAvailableCount(consumerId, {
      business,
      shippingType,
    });

    return result;
  }
);
