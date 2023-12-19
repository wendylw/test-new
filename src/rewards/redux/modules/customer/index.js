import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import { fetchCustomerInfo } from './thunks';

const initialState = {
  loadCustomerRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/customer',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchCustomerInfo.pending.type]: state => {
      state.loadCustomerRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadCustomerRequest.error = null;
    },
    [fetchCustomerInfo.fulfilled.type]: (state, { payload }) => {
      state.loadCustomerRequest.status = API_REQUEST_STATUS.SUCCESS;
      state.loadCustomerRequest.data = payload;
      state.loadCustomerRequest.error = null;
    },
    [fetchCustomerInfo.rejected.type]: (state, { error }) => {
      state.loadCustomerRequest.status = API_REQUEST_STATUS.ERROR;
      state.loadCustomerRequest.error = error;
    },
  },
});

export default reducer;
