import _get from 'lodash/get';
import { createSlice } from '@reduxjs/toolkit';
import Utils from '../../../../utils/utils';
import {
  loadOrder,
  loadPayLaterOrder,
  submitPayLaterOrder,
  loadPayLaterOrderStatus,
  loadOrderStoreReview,
  saveOrderStoreReview,
  showStoreReviewWarningModal,
  hideStoreReviewWarningModal,
  showStoreReviewLoadingIndicator,
  hideStoreReviewLoadingIndicator,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const PromotionItemModel = {
  promotionId: null,
  tax: 0,
  taxCode: null,
  code: null,
  promotionCode: null,
  promotionName: null,
  status: null,
  discount: 0,
  discountType: null,
};

const appliedVoucherModel = {
  voucherId: null,
  voucherCode: null,
  value: 0,
  cost: 0,
  purchaseChannel: null,
};

const loyaltyDiscountsModel = {
  displayDiscount: 0,
  spentValue: 0,
};

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
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
    warningModalVisible: false,
    loadingIndicatorVisible: false,
  },
  payLaterOrderInfo: {
    data: {
      orderStatus: null,
      receiptNumber: null,
      tableId: null,
      isStorePayByCashOnly: false,
      tax: 0,
      cashback: 0,
      displayPromotions: [],
      loyaltyDiscounts: [],
      appliedVoucher: null,
      total: 0,
      subtotal: 0,
      modifiedTime: null,
      serviceCharge: 0,
      serviceChargeInfo: {},
      shippingFee: 0,
      subOrders: [],
      items: [],
      applyCashback: false,
      redirectUrl: null,
      // Discount added from POS. It's a product items discount, meaning it's calculated only with respect to subtotal. --Jiwang said
      productsManualDiscount: 0,
    },
    loadOrderRequest: {
      status: null,
      error: null,
    },
    submitOrderRequest: {
      status: null,
      error: null,
    },
  },
  payLaterOrderStatusInfo: {
    data: {
      tableId: null,
      storeHash: null,
    },
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {
    updateCashbackApplyStatus(state, action) {
      state.payLaterOrderInfo.data.applyCashback = action.payload;
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
    [loadPayLaterOrder.pending.type]: state => {
      state.payLaterOrderInfo.loadOrderRequest.status = API_REQUEST_STATUS.PENDING;
      state.payLaterOrderInfo.loadOrderRequest.error = null;
    },
    [loadPayLaterOrder.fulfilled.type]: (state, { payload }) => {
      const { displayPromotions = [], loyaltyDiscounts = [], appliedVoucher, status: orderStatus, ...others } = {
        ...state.payLaterOrderInfo.data,
        ...payload,
      };

      state.payLaterOrderInfo.data = {
        ...others,
        orderStatus,
        loyaltyDiscounts: (loyaltyDiscounts || []).map(item => ({ ...loyaltyDiscountsModel, ...item })),
        displayPromotions: (displayPromotions || []).map(promotion => ({ ...PromotionItemModel, ...promotion })),
        appliedVoucher: { ...appliedVoucherModel, ...appliedVoucher },
      };
      state.payLaterOrderInfo.loadOrderRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [loadPayLaterOrder.rejected.type]: (state, { error }) => {
      state.payLaterOrderInfo.loadOrderRequest.error = error;
      state.payLaterOrderInfo.loadOrderRequest.status = API_REQUEST_STATUS.REJECTED;
    },
    [loadPayLaterOrderStatus.pending.type]: state => {
      state.payLaterOrderStatusInfo.status = API_REQUEST_STATUS.PENDING;
      state.payLaterOrderStatusInfo.error = null;
    },
    [loadPayLaterOrderStatus.fulfilled.type]: (state, { payload }) => {
      const { status, tableId, hash } = payload;

      // TODO: Migrate and update this data to payLaterOrderStatusInfo
      state.payLaterOrderInfo.data.orderStatus = status;
      state.payLaterOrderStatusInfo.data.tableId = tableId;

      // WB-4939: BE will only generate new h when the table id is changed for performance sake.
      // Therefore, we should only update the hash when needed.
      if (hash) {
        state.payLaterOrderStatusInfo.data.storeHash = hash;
      }

      // TODO: Migrate and update this data to payLaterOrderStatusInfo
      if (payload.redirectUrl) {
        state.payLaterOrderInfo.data.redirectUrl = payload.redirectUrl;
      }
      state.payLaterOrderStatusInfo.status = API_REQUEST_STATUS.FULFILLED;
    },
    [loadPayLaterOrderStatus.rejected.type]: (state, { error }) => {
      state.payLaterOrderStatusInfo.error = error;
      state.payLaterOrderStatusInfo.status = API_REQUEST_STATUS.REJECTED;
    },
    [submitPayLaterOrder.pending.type]: state => {
      state.payLaterOrderInfo.submitOrderRequest.status = API_REQUEST_STATUS.PENDING;
      state.payLaterOrderInfo.submitOrderRequest.error = null;
    },
    [submitPayLaterOrder.fulfilled.type]: (state, { payload }) => {
      if (payload.redirectUrl) {
        state.payLaterOrderInfo.data.redirectUrl = payload.redirectUrl;
      }
      state.payLaterOrderInfo.submitOrderRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [submitPayLaterOrder.rejected.type]: (state, { error }) => {
      state.payLaterOrderInfo.submitOrderRequest.error = error;
      state.payLaterOrderInfo.submitOrderRequest.status = API_REQUEST_STATUS.REJECTED;
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
      state.storeReviewInfo.data.isMerchantContactAllowable = _get(review, 'reviewContent.allowMerchantContact', true);
      state.storeReviewInfo.data.googleReviewURL = _get(review, 'googleReviewUrl', null);
      state.storeReviewInfo.data.storeName = _get(transaction, 'store.name', null);
      state.storeReviewInfo.data.storeDisplayName = _get(transaction, 'store.storeDisplayName', null);
      state.storeReviewInfo.data.shippingType = _get(transaction, 'shippingType', null);
      state.storeReviewInfo.data.orderId = _get(transaction, 'receiptNumber', null);
      state.storeReviewInfo.data.storeId = _get(transaction, 'storeId', null);
      state.storeReviewInfo.data.tableId = _get(transaction, 'tableId', null);
      state.storeReviewInfo.data.isExpired = _get(review, 'isExpired', false);
      state.storeReviewInfo.data.isSupportable = _get(review, 'supportable', false);
      state.storeReviewInfo.data.createdTime = _get(transaction, 'createdTime', '');

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
