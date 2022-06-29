import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import { locationDrawerShown, showErrorToast, clearErrorToast } from './thunks';

const initialState = {
  storeInfo: {
    data: {},
    status: null,
    error: null,
  },
  drawerInfo: {
    error: null,
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
      state.storeInfo.data = action.payload;
      state.storeInfo.status = API_REQUEST_STATUS.FULFILLED;
    },
    [locationDrawerShown.rejected.type]: (state, action) => {
      state.storeInfo.status = API_REQUEST_STATUS.REJECTED;
      state.storeInfo.error = action.error;
    },
    [showErrorToast.fulfilled.type]: (state, action) => {
      state.drawerInfo.error = action.payload;
    },
    [clearErrorToast.fulfilled.type]: state => {
      state.drawerInfo.error = null;
    },
  },
});

export default reducer;
