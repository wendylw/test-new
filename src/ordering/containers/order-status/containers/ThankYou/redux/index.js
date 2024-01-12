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
  /* included: customerId, consumerId, status */
  cashbackInfo: {
    customerId: null,
    consumerId: null,
    status: null,
    error: null,
  },
  updateCashbackInfoStatus: null,
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
      state.updateCashbackInfoStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = {
        ...state.cashbackInfo,
        ...payload,
        updateCashbackInfoStatus: API_REQUEST_STATUS.FULFILLED,
        createdCashbackInfo: false,
      };
    },
    [loadCashbackInfo.rejected.type]: (state, { error }) => {
      state.cashbackInfo.error = error;
      state.updateCashbackInfoStatus = API_REQUEST_STATUS.REJECTED;
    },
    [createCashbackInfo.pending.type]: state => {
      state.updateCashbackInfoStatus = API_REQUEST_STATUS.PENDING;
    },
    [createCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = {
        ...state.cashbackInfo,
        ...payload,
        updateCashbackInfoStatus: API_REQUEST_STATUS.FULFILLED,
        createdCashbackInfo: true,
      };
    },
    [createCashbackInfo.rejected.type]: (state, { error }) => {
      state.cashbackInfo.error = error;
      state.updateCashbackInfoStatus = API_REQUEST_STATUS.REJECTED;
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
