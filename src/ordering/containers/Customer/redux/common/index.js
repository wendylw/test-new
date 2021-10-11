/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { loadAddressList } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

const initialState = {
  addressList: {
    data: [],
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/customer/common',
  initialState,
  extraReducers: {
    [loadAddressList.pending.type]: state => {
      state.addressList.status = API_REQUEST_STATUS.PENDING;
    },

    [loadAddressList.fulfilled.type]: (state, action) => {
      state.addressList.data = action.payload;
      state.addressList.status = API_REQUEST_STATUS.FULFILLED;
      state.addressList.error = null;
    },

    [loadAddressList.rejected.type]: (state, action) => {
      state.addressList.data = [];
      state.addressList.status = API_REQUEST_STATUS.FULFILLED;
      state.addressList.error = action.error;
    },
  },
});

export default reducer;
