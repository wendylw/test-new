import { createSlice } from '@reduxjs/toolkit';
import {
  loadCashbackInfo,
  createCashbackInfo,
  loadStoreIdHashCode,
  loadStoreIdTableIdHashCode,
  cancelOrder,
  updateOrderShippingType,
  loadFoodCourtIdHashCode,
  showProfileModal,
  hideProfileModal,
  updateRedirectFrom,
  joinBusinessMembership,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';

const initialState = {
  storeHashCode: null,
  orderCancellationReasonAsideVisible: false,
  updateShippingTypeStatus: null, // pending || fulfilled || rejected
  updateShippingTypeError: null,
  cancelOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderError: null,
  profileModalVisibility: false,
  foodCourtInfo: {
    hashCode: null,
  },
  redirectFrom: null,
  updateRedirectFromStatus: null, // FIXME: refactor later
  joinBusinessMembershipRequest: {
    status: null,
    error: null,
  },
  loadCashbackRequest: {
    data: null,
    status: null,
    error: null,
  },
  claimCashbackRequest: {
    data: {
      customerId: null,
      consumerId: null,
      status: null,
    },
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/thankYou',
  initialState,
  reducers: {
    updateCancellationReasonVisibleState(state, action) {
      state.orderCancellationReasonAsideVisible = action.payload;
    },
    setShowProfileVisibility(state, action) {
      state.profileModalVisibility = action.payload;
    },
  },
  extraReducers: {
    // For sake of completeness
    [updateRedirectFrom.pending.type]: state => {
      state.updateRedirectFromStatus = API_REQUEST_STATUS.PENDING;
    },
    [updateRedirectFrom.fulfilled.type]: (state, { payload }) => {
      state.redirectFrom = payload;
      state.updateRedirectFromStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [updateRedirectFrom.rejected.type]: state => {
      state.updateRedirectFromStatus = API_REQUEST_STATUS.REJECTED;
    },
    [loadCashbackInfo.pending.type]: state => {
      state.loadCashbackRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadCashbackRequest.error = null;
    },
    [loadCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.loadCashbackRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadCashbackRequest.data = payload;
    },
    [loadCashbackInfo.rejected.type]: (state, { error }) => {
      state.loadCashbackRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadCashbackRequest.error = error;
    },
    [createCashbackInfo.pending.type]: state => {
      state.claimCashbackRequest.status = API_REQUEST_STATUS.PENDING;
      state.claimCashbackRequest.error = null;
    },
    [createCashbackInfo.fulfilled.type]: (state, { payload }) => {
      const { customerId, consumerId, status } = payload;

      state.claimCashbackRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.claimCashbackRequest.data.customerId = customerId;
      state.claimCashbackRequest.data.consumerId = consumerId;
      state.claimCashbackRequest.data.status = status;
    },
    [createCashbackInfo.rejected.type]: (state, { error }) => {
      state.claimCashbackRequest.status = API_REQUEST_STATUS.REJECTED;
      state.claimCashbackRequest.error = error;
    },
    [loadStoreIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.storeHashCode = payload.redirectTo;
    },
    [loadStoreIdTableIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.storeHashCode = payload.hex;
    },
    [cancelOrder.pending.type]: state => {
      state.cancelOrderStatus = API_REQUEST_STATUS.PENDING;
      state.cancelOrderError = null;
    },
    [cancelOrder.fulfilled.type]: state => {
      state.cancelOrderStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [cancelOrder.rejected.type]: (state, { error }) => {
      state.cancelOrderError = error;
      state.cancelOrderStatus = API_REQUEST_STATUS.REJECTED;
    },
    [updateOrderShippingType.pending.type]: state => {
      state.updateShippingTypeStatus = API_REQUEST_STATUS.PENDING;
      state.updateShippingTypeError = null;
    },
    [updateOrderShippingType.fulfilled.type]: state => {
      state.updateShippingTypeStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [updateOrderShippingType.rejected.type]: (state, { error }) => {
      state.updateShippingTypeError = error;
      state.updateShippingTypeStatus = API_REQUEST_STATUS.REJECTED;
    },
    [loadFoodCourtIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.foodCourtInfo.hashCode = payload.hex;
    },
    [showProfileModal.fulfilled.type]: state => {
      state.profileModalVisibility = true;
    },
    [hideProfileModal.fulfilled.type]: state => {
      state.profileModalVisibility = false;
    },
    [joinBusinessMembership.pending.type]: state => {
      state.joinBusinessMembershipRequest.status = API_REQUEST_STATUS.PENDING;
      state.joinBusinessMembershipRequest.error = null;
    },
    [joinBusinessMembership.fulfilled.type]: state => {
      state.joinBusinessMembershipRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [joinBusinessMembership.rejected.type]: (state, { error }) => {
      state.joinBusinessMembershipRequest.status = API_REQUEST_STATUS.REJECTED;
      state.joinBusinessMembershipRequest.error = error;
    },
  },
});

export { actions };

export default reducer;
