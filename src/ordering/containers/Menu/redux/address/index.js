import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import { locationDrawerShown, showErrorToast, clearErrorToast } from './thunks';

const initialState = {
  storeInfo: {
    data: {},
    status: null,
    error: null,
  },
  errorToast: {
    data: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/address',
  initialState,
  extraReducers: {
    [locationDrawerShown.pending.type]: state => {
      state.storeInfo.status = API_REQUEST_STATUS.PENDING;
      state.storeInfo.error = null;
    },
    [locationDrawerShown.fulfilled.type]: (state, action) => {
      const { coords, country, radius } = action.payload;
      state.storeInfo.data = { coords, country, radius };
      state.storeInfo.status = API_REQUEST_STATUS.FULFILLED;
    },
    [locationDrawerShown.rejected.type]: (state, action) => {
      state.storeInfo.status = API_REQUEST_STATUS.REJECTED;
      state.storeInfo.error = action.error;
    },
    [showErrorToast.fulfilled.type]: (state, action) => {
      const { message } = action.payload;
      state.errorToast.data = message;
    },
    [clearErrorToast.fulfilled.type]: state => {
      state.errorToast.data = null;
    },
  },
});

export default reducer;
