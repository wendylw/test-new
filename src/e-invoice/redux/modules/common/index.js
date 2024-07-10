import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { fetchEInvoiceStatus, fetchEInvoiceSubmissionDetail } from './thunks';

const initialState = {
  loadEInvoiceStatusRequest: {
    data: null,
    status: null,
    error: null,
  },
  loadEInvoiceSubmissionDetailRequest: {
    data: null,
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'eInvoice/common',
  initialState,
  reducers: {
    loadEInvoiceStatusRequestErrorReset: state => {
      state.loadEInvoiceStatusRequest.error = initialState.error;
    },
  },
  extraReducers: {
    [fetchEInvoiceStatus.pending.type]: state => {
      state.loadEInvoiceStatusRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadEInvoiceStatusRequest.error = null;
    },
    [fetchEInvoiceStatus.fulfilled.type]: (state, { payload }) => {
      state.loadEInvoiceStatusRequest.data = payload;
      state.loadEInvoiceStatusRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadEInvoiceStatusRequest.error = null;
    },
    [fetchEInvoiceStatus.rejected.type]: (state, { error }) => {
      state.loadEInvoiceStatusRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadEInvoiceStatusRequest.error = error;
    },
    [fetchEInvoiceSubmissionDetail.pending.type]: state => {
      state.loadEInvoiceSubmissionDetailRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadEInvoiceSubmissionDetailRequest.error = null;
    },
    [fetchEInvoiceSubmissionDetail.fulfilled.type]: (state, { payload }) => {
      state.loadEInvoiceSubmissionDetailRequest.data = payload;
      state.loadEInvoiceSubmissionDetailRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadEInvoiceSubmissionDetailRequest.error = null;
    },
    [fetchEInvoiceSubmissionDetail.rejected.type]: (state, { error }) => {
      state.loadEInvoiceSubmissionDetailRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadEInvoiceSubmissionDetailRequest.error = error;
    },
  },
});

export { actions };

export default reducer;
