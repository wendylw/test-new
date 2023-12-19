/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { getAddressInfo, setAddressInfo } from './thunks';
import { API_REQUEST_STATUS } from '../../../utils/constants';

/*
addressInfo data structure : {
  placeId: null,
  savedAddressId: null,
  fullName: '',
  shortName: '',
  coords: null,
  countryCode: '',
  postCode: '',
  city: '',
}
*/

const initialState = {
  addressInfo: {
    data: null,
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'app/address',
  initialState,
  reducers: {},
  extraReducers: {
    [getAddressInfo.pending.type]: state => {
      state.addressInfo.status = API_REQUEST_STATUS.PENDING;
      state.addressInfo.error = null;
    },
    [getAddressInfo.fulfilled.type]: (state, { payload }) => {
      state.addressInfo.data = payload;
      state.addressInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.addressInfo.error = null;
    },
    [getAddressInfo.rejected.type]: (state, { error }) => {
      state.addressInfo.status = API_REQUEST_STATUS.REJECTED;
      state.addressInfo.error = error;
    },
    [setAddressInfo.pending.type]: state => {
      state.addressInfo.status = API_REQUEST_STATUS.PENDING;
      state.addressInfo.error = null;
    },
    [setAddressInfo.fulfilled.type]: (state, { payload }) => {
      state.addressInfo.data = payload;
      state.addressInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.addressInfo.error = null;
    },
    [setAddressInfo.rejected.type]: (state, { error }) => {
      state.addressInfo.status = API_REQUEST_STATUS.REJECTED;
      state.addressInfo.error = error;
    },
  },
});

export default reducer;
export { actions };
