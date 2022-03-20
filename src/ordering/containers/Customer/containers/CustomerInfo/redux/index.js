/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customerError: {
    show: false,
    message: '',
    description: '',
    buttonText: '',
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
});

export default reducer;
