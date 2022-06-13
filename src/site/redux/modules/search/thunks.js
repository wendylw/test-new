import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStoreList } from './api-request';
import { storesActionCreators } from '../entities/stores';
import { getPageInfo, getShippingType, getSearchStoreParams } from './selectors';

export const setPageInfo = createAsyncThunk('site/search/setPageInfo', async (payload, { getState }) => {
  const state = getState();
  const prevPageInfo = getPageInfo(state);

  return { ...prevPageInfo, ...payload };
});

export const resetPageInfo = createAsyncThunk('site/search/resetPageInfo', async () => {});

export const setShippingType = createAsyncThunk(
  'site/search/setShippingType',
  async ({ shippingType }) => shippingType
);

export const resetShippingType = createAsyncThunk('site/search/resetShippingType', async () => {});

export const loadStoreList = createAsyncThunk('site/search/loadStoreList', async (_, { dispatch, getState }) => {
  const state = getState();
  const { loading, hasMore, page } = getPageInfo(state);
  const shippingType = getShippingType(state);

  // We need to avoid sending the search API when the shipping type hasn't been set yet.
  // Also, if the previous search API request is still in progress, we need to wait for it to finish first (no redundant request will be sent for performance sake).
  if (!shippingType || loading || !hasMore) return null;

  await dispatch(
    setPageInfo({
      hasMore: page === 0 ? true : hasMore,
      loading: true,
    })
  );

  const queryString = `?${getSearchStoreParams(state)}`;
  const response = await fetchStoreList(queryString);

  if (response && Array.isArray(response.stores)) {
    await dispatch(storesActionCreators.saveStores(response.stores));
  }
  return response;
});

export const resetStoreList = createAsyncThunk('site/search/resetStoreList', async () => {});
