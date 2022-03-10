/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { loadAddressDetails } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';

const initialState = {
  customerError: {
    show: false,
    message: '',
    description: '',
    buttonText: '',
  },
  addressDetails: {
    data: null,
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'ordering/customer/customerInfo',
  initialState,
  reducers: {
    setCustomerError(state, action) {
      state.customerError = action.payload;
    },

    clearCustomerError(state) {
      state.customerError = initialState.customerError;
    },
  },
  extraReducers: {
    [loadAddressDetails.pending.type]: state => {
      state.addressDetails.status = API_REQUEST_STATUS.PENDING;
      state.addressDetails.error = null;
    },
    [loadAddressDetails.fulfilled.type]: (state, { payload }) => {
      state.addressDetails.status = API_REQUEST_STATUS.FULFILLED;
      state.addressDetails.data = payload;
      state.addressDetails.error = null;
    },
    [loadAddressDetails.rejected.type]: (state, action) => {
      state.addressDetails.status = API_REQUEST_STATUS.REJECTED;
      state.addressDetails.error = action.error;
    },
  },
});

export default reducer;
