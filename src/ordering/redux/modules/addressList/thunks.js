import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId, getStoreId } from '../app';
import { fetchWithStoreDistanceStatusAddressList, fetchAddressList } from './api-request';

export const loadAddressList = createAsyncThunk('ordering/addressList/loadAddressList', async (_, { getState }) => {
  const state = getState();
  const consumerId = getUserConsumerId(state);
  const storeId = getStoreId(state);

  if (storeId) {
    return fetchWithStoreDistanceStatusAddressList(consumerId, storeId);
  }

  return fetchAddressList(consumerId);
});

export const resetAddressListStatus = createAsyncThunk('ordering/addressList/resetAddressListStatus', async () => {});
