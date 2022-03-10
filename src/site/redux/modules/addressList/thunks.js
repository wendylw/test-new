import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId } from '../app';
import { fetchAddressList } from './api-request';

export const loadAddressList = createAsyncThunk('site/common/addressList/loadAddressList', async (_, { getState }) => {
  const state = getState();
  const consumerId = getUserConsumerId(state);

  return fetchAddressList(consumerId);
});
