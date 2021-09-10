import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrderHistory } from './api-request';
import { getUserConsumerId } from '../../redux/modules/app';
import { getPageSize, getPage } from './selectors';

export const initOrderHistoryData = createAsyncThunk(
  'site/app/orderHistory/initOrderHistoryData',
  async (_, { getState }) => {
    const consumerId = getUserConsumerId(getState());
    const pageSize = getPageSize(getState());

    return fetchOrderHistory({
      consumerId,
      page: 1,
      pageSize,
    });
  }
);

export const loadNextOrderHistoryData = createAsyncThunk(
  'site/app/orderHistory/loadNextOrderHistoryData',
  async (_, { getState }) => {
    const consumerId = getUserConsumerId(getState());
    const pageSize = getPageSize(getState());
    const currentPage = getPage(getState());

    return fetchOrderHistory({
      consumerId,
      page: currentPage + 1,
      pageSize,
    });
  }
);
