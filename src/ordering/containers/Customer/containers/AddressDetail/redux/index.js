/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  type: '',
  name: '',
  address: '',
  details: '',
  comments: '',
  coords: {
    longitude: 0,
    latitude: 0,
  },
  addressComponents: {},
};

export const { actions, reducer } = createSlice({
  name: 'ordering/customer/addressDetail',
  initialState,
  reducers: {
    updateAddressInfo(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    removeAddressInfo() {
      return { ...initialState };
    },
  },
});

export default reducer;

export const getAddressInfo = state => state.customer.addressDetail;
