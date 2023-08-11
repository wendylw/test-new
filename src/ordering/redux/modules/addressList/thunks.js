import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId, getStoreId } from '../app';
import { fetchAddressList } from './api-request';

export const loadAddressList = createAsyncThunk('ordering/addressList/loadAddressList', async (_, { getState }) => {
  const state = getState();
  const consumerId = getUserConsumerId(state);
  const storeId = getStoreId(state);

  return fetchAddressList(consumerId, storeId);
});

export const resetAddressListStatus = createAsyncThunk('ordering/addressList/resetAddressListStatus', async () => {});
