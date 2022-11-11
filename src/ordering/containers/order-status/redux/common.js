import _get from 'lodash/get';
import Utils from '../../../../utils/utils';
import { createSlice } from '@reduxjs/toolkit';
import {
  loadOrder,
  loadOrderStoreReview,
  saveOrderStoreReview,
  showStoreReviewThankYouModal,
  hideStoreReviewThankYouModal,
  showStoreReviewWarningModal,
  hideStoreReviewWarningModal,
  showStoreReviewLoadingIndicator,
  hideStoreReviewLoadingIndicator,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  shippingType: Utils.getQueryString('type'),
  order: null,
  updateShippingTypeStatus: null, // pending || fulfilled || rejected
  updateOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderStatus: null, // pending || fulfilled || rejected
  error: null,
  storeReviewInfo: {
    data: {},
    loadDataRequest: {
      status: null,
      error: null,
    },
    saveDataRequest: {
      status: null,
      error: null,
    },
    thankYouModalVisible: false,
    warningModalVisible: false,
    loadingIndicatorVisible: false,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {},
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

      state.storeReviewInfo.data.hasReviewed = _get(review, 'reviewed', false);
      state.storeReviewInfo.data.isReviewable = _get(review, 'reviewable', false);
      state.storeReviewInfo.data.rating = _get(review, 'reviewContent.rating', null);
      state.storeReviewInfo.data.comments = _get(review, 'reviewContent.comments', null);
      state.storeReviewInfo.data.isMerchantContactAllowable = _get(review, 'reviewContent.allowMerchantContact', false);
      state.storeReviewInfo.data.googleReviewURL = _get(review, 'googleReviewUrl', null);
      state.storeReviewInfo.data.storeName = _get(transaction, 'store.name', null);
      state.storeReviewInfo.data.storeDisplayName = _get(transaction, 'store.storeDisplayName', null);
      state.storeReviewInfo.data.shippingType = _get(transaction, 'shippingType', null);
      state.storeReviewInfo.data.orderId = _get(transaction, 'receiptNumber', null);
      state.storeReviewInfo.data.storeId = _get(transaction, 'storeId', null);
      state.storeReviewInfo.data.tableId = _get(transaction, 'tableId', null);
      state.storeReviewInfo.data.isExpired = _get(review, 'isExpired', false);
      state.storeReviewInfo.data.isSupportable = _get(review, 'supportable', false);

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
    [saveOrderStoreReview.fulfilled.type]: (state, { payload }) => {
      const { rating, comments, allowMerchantContact } = payload;

      state.storeReviewInfo.data.rating = rating;
      state.storeReviewInfo.data.comments = comments;
      state.storeReviewInfo.data.isMerchantContactAllowable = allowMerchantContact;
      state.storeReviewInfo.data.hasReviewed = true;
      state.storeReviewInfo.saveDataRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [saveOrderStoreReview.rejected.type]: (state, { error }) => {
      state.storeReviewInfo.saveDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.storeReviewInfo.saveDataRequest.error = error;
    },
    [showStoreReviewThankYouModal.fulfilled.type]: state => {
      state.storeReviewInfo.thankYouModalVisible = true;
    },
    [hideStoreReviewThankYouModal.fulfilled.type]: state => {
      state.storeReviewInfo.thankYouModalVisible = false;
    },
    [showStoreReviewWarningModal.fulfilled.type]: state => {
      state.storeReviewInfo.warningModalVisible = true;
    },
    [hideStoreReviewWarningModal.fulfilled.type]: state => {
      state.storeReviewInfo.warningModalVisible = false;
    },
    [showStoreReviewLoadingIndicator.fulfilled.type]: state => {
      state.storeReviewInfo.loadingIndicatorVisible = true;
    },
    [hideStoreReviewLoadingIndicator.fulfilled.type]: state => {
      state.storeReviewInfo.loadingIndicatorVisible = false;
    },
  },
});

export { actions };

export default reducer;
