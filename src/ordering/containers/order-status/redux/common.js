import _get from 'lodash/get';
import Utils from '../../../../utils/utils';
import { createSlice } from '@reduxjs/toolkit';
import { loadOrder, loadOrderStoreReview, saveOrderStoreReview } from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
  updateShippingTypeStatus: null, // pending || fulfilled || rejected
  updateOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderStatus: null, // pending || fulfilled || rejected
  error: null,
  storeReviewInfo: {
    data: null,
    loadDataRequest: {
      status: null,
      error: null,
    },
    saveDataRequest: {
      status: null,
      error: null,
    },
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {
    updateStoreRating(state, action) {
      state.storeReviewInfo.data.rating = action.payload;
    },
    resetLoadStoreReviewDataRequest(state) {
      state.storeReviewInfo.loadDataRequest.status = null;
      state.storeReviewInfo.loadDataRequest.error = null;
    },
    updateStoreComment(state, action) {
      state.storeReviewInfo.data.comments = action.payload;
    },
    resetStoreReviewData(state) {
      state.storeReviewInfo.data = null;
    },
  },
  extraReducers: {
    [loadOrder.pending.type]: state => {
      state.updateOrderStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.updateOrderStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [loadOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateOrderStatus = API_REQUEST_STATUS.REJECTED;
    },
    [loadOrderStoreReview.pending.type]: state => {
      state.storeReviewInfo.loadDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.storeReviewInfo.loadDataRequest.error = null;
    },
    [loadOrderStoreReview.fulfilled.type]: (state, { payload }) => {
      const { review, transaction } = payload;
      state.storeReviewInfo.data = {
        hasReviewed: _get(review, 'reviewed', false),
        isReviewable: _get(review, 'reviewable', false),
        rating: _get(review, 'reviewContent.rating', null),
        comments: _get(review, 'reviewContent.comments', null),
        isMerchantContactAllowable: _get(review, 'reviewContent.allowMerchantContact', false),
        googleReviewURL: _get(review, 'googleReviewUrl', null),
        storeName: _get(transaction, 'store.name', null),
        storeDisplayName: _get(transaction, 'store.storeDisplayName', null),
        shippingType: _get(transaction, 'shippingType', null),
      };
      state.storeReviewInfo.loadDataRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [loadOrderStoreReview.rejected.type]: (state, { error }) => {
      state.storeReviewInfo.loadDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.storeReviewInfo.loadDataRequest.error = error;
    },
    [saveOrderStoreReview.pending.type]: state => {
      state.storeReviewInfo.saveDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.storeReviewInfo.saveDataRequest.error = null;
    },
    [saveOrderStoreReview.fulfilled.type]: state => {
      state.storeReviewInfo.saveDataRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [saveOrderStoreReview.rejected.type]: (state, { error }) => {
      state.storeReviewInfo.saveDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.storeReviewInfo.saveDataRequest.error = error;
    },
  },
});

export { actions };

export default reducer;
