import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCustomerInfo } from './api-request';
import { getConsumerId } from '../../../../redux/modules/user/selectors';

export const fetchCustomerInfo = createAsyncThunk('app/customer/fetchCustomerInfo', async (business, { getState }) => {
  const state = getState();
  const consumerId = getConsumerId(state);
  const result = await getCustomerInfo({ consumerId, business });

  return result;
});
