import Utils from '../../../../utils/utils';
import { createSlice } from '@reduxjs/toolkit';
import { loadOrder } from './thunks';

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
  updateShippingTypeStatus: null, // pending || fulfilled || rejected
  updateOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderStatus: null, // pending || fulfilled || rejected
  storeReviewInfo: {
    data: {
      rating: null,
      comments: '',
      storeName: null,
      shippingType: null,
      googleReviewURL: null,
      hasReviewed: false,
      isReviewable: false,
      isMerchantContactAllowable: false,
    },
    status: null,
    error: null,
  },
  error: null,
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {
    updateStoreRating(state, action) {
      state.storeReviewInfo.data.rating = action.payload;
    },
    updateAndSaveComments(state, action) {
      state.storeReviewInfo.data.comments = action.payload;
    },
    updateAndSaveRating(state, action) {
      state.storeReviewInfo.data.rating = action.payload;
    },
  },
  extraReducers: {
    [loadOrder.pending.type]: state => {
      state.updateOrderStatus = 'pending';
    },
    [loadOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.updateOrderStatus = 'fulfilled';
    },
    [loadOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateOrderStatus = 'rejected';
    },
  },
});

export { actions };

export default reducer;
