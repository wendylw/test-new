/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { showProductDetail, getUserAlcoholConsent, setUserAlcoholConsent } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

const initialState = {
  selectedProductDetail: {
    categoryId: null,
    productId: null,
  },
  alcoholConsent: {
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
  },
});

export default reducer;

export { actions };
