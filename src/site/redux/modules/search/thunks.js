import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStoreList } from './api-request';
import { storesActionCreators } from '../entities/stores';
import { getSearchStoreParams } from './selectors';

export const loadStoreList = createAsyncThunk('site/search/loadStoreList', async (_, { dispatch, getState }) => {
  const state = getState();
  const queryString = `?${getSearchStoreParams(state)}`;
  const response = await fetchStoreList(queryString);

  if (response && Array.isArray(response.stores)) {
    await dispatch(storesActionCreators.saveStores(response.stores));
  }
  return response;
});

export const resetPageInfo = createAsyncThunk('site/search/resetPageInfo', async () => {});

export const setShippingType = createAsyncThunk(
  'site/search/setShippingType',
  async ({ shippingType }) => shippingType
);
