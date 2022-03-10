import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId, getStoreId } from '../../../../../redux/modules/app';
import { getSavedAddressId } from '../../../../../../redux/modules/address/selectors';
import { fetchAddressDetails } from './api-request';

export const loadAddressDetails = createAsyncThunk(
  'ordering/customerInfo/loadAddressDetails',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);
    const savedAddressId = getSavedAddressId(state);

    return fetchAddressDetails(consumerId, storeId, savedAddressId);
  }
);
