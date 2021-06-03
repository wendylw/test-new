import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../../../../../utils/api/api-fetch';
import { API_INFO } from '../../../redux/api-info';
import Constants from '../../../../../../utils/constants';

export const loadCashbackInfo = createAsyncThunk('ordering/orderStatus/thankYou/fetchCashbackInfo', async orderId => {
  const { url, queryParams } = API_INFO.getCashbackInfo(orderId, Constants.CASHBACK_SOURCE.QR_ORDERING);
  const result = await get(url, { queryParams });

  return result;
});

export const createCashbackInfo = createAsyncThunk(
  'ordering/orderStatus/thankYou/createCashbackInfo',
  async (orderId, phone) => {
    const result = await post(API_INFO.createCashbackInfo().url, {
      receiptNumber: orderId,
      phone,
      source: Constants.CASHBACK_SOURCE.QR_ORDERING,
    });

    return result;
  }
);

export const loadStoreIdHashCode = createAsyncThunk(
  'ordering/orderStatus/thankYou/fetchStoreIdHashCode',
  async storeId => {
    const { url, queryParams } = API_INFO.getStoreIdHashCode(storeId);
    const result = await get(url, { queryParams });

    return result;
  }
);

export const loadStoreIdTableIdHashCode = createAsyncThunk(
  'ordering/orderStatus/thankYou/fetchStoreIdTableIdHashCode',
  async (storeId, tableId) => {
    const result = await get(API_INFO.createStoreIdTableIdHashCode(storeId).url, {
      tableId,
    });

    return result;
  }
);
