import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import {
  updateShareConsumerInfoRequests,
  confirmToShareConsumerInfoRequests,
  updateStoreRedemptionRequestId,
} from './thunks';

const initialState = {
  requestId: null,
  sharedInfoData: {
    id: '',
    merchantName: '',
    expiredDate: '',
    scannedDate: '',
    source: '',
    consumerId: '',
    customerId: '',
    sharedInfoDate: '',
    isNewCustomer: false,
  },
  updateSharingConsumerInfo: {
    status: null,
  },
  confirmSharingConsumerInfo: {
    status: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'loyalty/storeRedemption',
  initialState,
  reducers: {},
  extraReducers: {
    [updateShareConsumerInfoRequests.pending.type]: state => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.PENDING;
    },
    [updateShareConsumerInfoRequests.fulfilled.type]: (state, { payload }) => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.sharedInfoData = payload;
    },
    [updateShareConsumerInfoRequests.rejected.type]: state => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.REJECTED;
    },
    [confirmToShareConsumerInfoRequests.pending.type]: state => {
      state.confirmSharingConsumerInfo.status = API_REQUEST_STATUS.PENDING;
    },
    [confirmToShareConsumerInfoRequests.fulfilled.type]: (state, { payload }) => {
      state.confirmSharingConsumerInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.sharedInfoData = payload;
    },
    [confirmToShareConsumerInfoRequests.rejected.type]: state => {
      state.confirmSharingConsumerInfo.status = API_REQUEST_STATUS.REJECTED;
    },
    [updateStoreRedemptionRequestId.fulfilled.type]: (state, { payload }) => {
      state.requestId = payload;
    },
  },
});

export default reducer;
