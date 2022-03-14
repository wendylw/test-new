/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import {
  showProductDetail,
  getUserAlcoholConsent,
  setUserAlcoholConsent,
  getUserSaveStoreStatus,
  toggleUserSaveStoreStatus,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

const initialState = {
  selectedProductDetail: {
    categoryId: null,
    productId: null,
  },
  alcoholConsent: {
    data: null,
    status: null,
    error: null,
  },
  storeSaveStatus: {
    data: false,
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/home/common',
  initialState,
  reducers: {},
  extraReducers: {
    [showProductDetail.fulfilled.type]: (state, { payload }) => {
      state.selectedProductDetail.categoryId = payload.categoryId;
      state.selectedProductDetail.productId = payload.productId;
    },
    [getUserAlcoholConsent.pending.type]: state => {
      state.alcoholConsent.status = API_REQUEST_STATUS.PENDING;
    },
    [getUserAlcoholConsent.fulfilled.type]: (state, { payload }) => {
      state.alcoholConsent.data = payload;
      state.alcoholConsent.status = API_REQUEST_STATUS.FULFILLED;
    },
    [getUserAlcoholConsent.rejected.type]: (state, { error }) => {
      state.alcoholConsent.status = API_REQUEST_STATUS.REJECTED;
      state.alcoholConsent.error = error;
    },
    [setUserAlcoholConsent.pending.type]: state => {
      state.alcoholConsent.status = API_REQUEST_STATUS.PENDING;
    },
    [setUserAlcoholConsent.fulfilled.type]: (state, { payload }) => {
      state.alcoholConsent.data = payload;
      state.alcoholConsent.status = API_REQUEST_STATUS.FULFILLED;
    },
    [setUserAlcoholConsent.rejected.type]: (state, { error }) => {
      state.alcoholConsent.status = API_REQUEST_STATUS.REJECTED;
      state.alcoholConsent.error = error;
    },
    [getUserSaveStoreStatus.pending.type]: state => {
      state.storeSaveStatus.status = API_REQUEST_STATUS.PENDING;
      state.storeSaveStatus.error = null;
    },
    [getUserSaveStoreStatus.fulfilled.type]: (state, { payload }) => {
      state.storeSaveStatus.status = API_REQUEST_STATUS.FULFILLED;
      state.storeSaveStatus.data = payload;
    },
    [getUserSaveStoreStatus.rejected.type]: (state, { error }) => {
      state.storeSaveStatus.status = API_REQUEST_STATUS.REJECTED;
      state.storeSaveStatus.error = error;
    },
    [toggleUserSaveStoreStatus.pending.type]: state => {
      state.storeSaveStatus.status = API_REQUEST_STATUS.PENDING;
      state.storeSaveStatus.error = null;
    },
    [toggleUserSaveStoreStatus.fulfilled.type]: (state, { payload }) => {
      state.storeSaveStatus.status = API_REQUEST_STATUS.FULFILLED;
      state.storeSaveStatus.data = payload;
    },
    [toggleUserSaveStoreStatus.rejected.type]: (state, { error }) => {
      state.storeSaveStatus.status = API_REQUEST_STATUS.REJECTED;
      state.storeSaveStatus.error = error;
    },
  },
});

export default reducer;

export { actions };
