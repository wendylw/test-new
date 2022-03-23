/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { selectAvailableAddress } from './thunks';

const initialState = {
  customerError: {
    show: false,
    message: '',
    description: '',
    buttonText: '',
  },
  selectAvailableAddress: {
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
    [selectAvailableAddress.pending.type]: state => {
      state.selectAvailableAddress.status = API_REQUEST_STATUS.PENDING;
    },
    [selectAvailableAddress.fulfilled.type]: state => {
      state.selectAvailableAddress.status = API_REQUEST_STATUS.FULFILLED;
      state.selectAvailableAddress.error = null;
    },
    [selectAvailableAddress.rejected.type]: (state, action) => {
      state.selectAvailableAddress.status = API_REQUEST_STATUS.REJECTED;
      state.selectAvailableAddress.error = action.error;
    },
  },
});

export default reducer;
