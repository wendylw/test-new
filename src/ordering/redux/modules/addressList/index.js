/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { loadAddressList } from './thunks';
import { API_REQUEST_STATUS } from '../../../../utils/constants';

const initialState = {
  addressList: {
    data: {}, // {${addressId}: ${addressObject}}
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/addressList',
  initialState,
  reducers: {
    updateAddress(state, action) {
      const address = action.payload;
      // eslint-disable-next-line no-underscore-dangle
      state.addressList.data[address._id] = address;
    },
  },
  extraReducers: {
    [loadAddressList.pending.type]: state => {
      state.addressList.status = API_REQUEST_STATUS.PENDING;
      state.addressList.error = null;
    },

    [loadAddressList.fulfilled.type]: (state, action) => {
      const addressList = action.payload;
      const addressIdMaps = {};
      addressList.forEach(address => {
        // eslint-disable-next-line no-underscore-dangle
        addressIdMaps[address._id] = address;
      });

      state.addressList.data = addressIdMaps;
      state.addressList.status = API_REQUEST_STATUS.FULFILLED;
      state.addressList.error = null;
    },

    [loadAddressList.rejected.type]: (state, action) => {
      state.addressList.status = API_REQUEST_STATUS.REJECTED;
      state.addressList.error = action.error;
    },
  },
});

export default reducer;
