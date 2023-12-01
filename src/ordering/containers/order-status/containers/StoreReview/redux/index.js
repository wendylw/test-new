import { createSlice } from '@reduxjs/toolkit';
import {
  initOffline,
  showStoreReviewThankYouModal,
  hideStoreReviewThankYouModal,
  showStoreReviewSuccessToast,
  hideStoreReviewSuccessToast,
} from './thunks';

const initialState = {
  offline: false,
  successToastVisible: false,
  thankYouModalVisible: false,
};

export const { actions, reducer } = createSlice({
  name: 'ordering/orderStatus/storeReview',
  initialState,
  extraReducers: {
    [initOffline.fulfilled.type]: (state, { payload }) => {
      const { offline } = payload;
      state.offline = offline;
    },
    [showStoreReviewThankYouModal.fulfilled.type]: state => {
      state.thankYouModalVisible = true;
    },
    [hideStoreReviewThankYouModal.fulfilled.type]: state => {
      state.thankYouModalVisible = false;
    },
    [showStoreReviewSuccessToast.fulfilled.type]: state => {
      state.successToastVisible = true;
    },
    [hideStoreReviewSuccessToast.fulfilled.type]: state => {
      state.successToastVisible = false;
    },
  },
});

export default reducer;
