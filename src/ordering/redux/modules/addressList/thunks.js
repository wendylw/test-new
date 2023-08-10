import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId, getStoreId } from '../app';
import { fetchAddressList } from './api-request';
import logger from '../../../../utils/monitoring/logger';

export const loadAddressList = createAsyncThunk('ordering/addressList/loadAddressList', async (_, { getState }) => {
  try {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);

    if (!storeId) {
      throw new Error('loadAddressList Store Id is not found');
    }

    return fetchAddressList(consumerId, storeId);
  } catch (error) {
    logger.error('Ordering_AddressList_loadAddressListFailed', { message: error?.message || '' });

    throw error;
  }
});

export const resetAddressListStatus = createAsyncThunk('ordering/addressList/resetAddressListStatus', async () => {});
