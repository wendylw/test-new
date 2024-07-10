import { createSlice } from '@reduxjs/toolkit';
import { fetchEInvoice, setTimeoutError, resetTimeoutError } from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const initialState = {
  loadEInvoiceRequest: {
    data: null,
    status: null,
    error: null,
  },
  timeoutError: null,
};

const { reducer, actions } = createSlice({
  name: 'eInvoice/home',
  initialState,
  reducers: {
    eInvoiceReset: () => initialState,
    timeoutErrorSet: (state, { payload }) => {
      state.timeoutError = payload;
    },
    timeoutErrorReset: state => {
      state.timeoutError = initialState.timeoutError;
    },
  },
  extraReducers: {
    [setTimeoutError.fulfilled.type]: (state, { payload }) => {
      state.timeoutError = payload;
    },
    [resetTimeoutError.fulfilled.type]: state => {
      state.timeoutError = initialState.timeoutError;
    },
    [fetchEInvoice.pending.type]: state => {
      state.loadEInvoiceRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadEInvoiceRequest.error = null;
    },
    [fetchEInvoice.fulfilled.type]: (state, { payload }) => {
      state.loadEInvoiceRequest.data = payload;
      state.loadEInvoiceRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadEInvoiceRequest.error = null;
    },
    [fetchEInvoice.rejected.type]: (state, { error }) => {
      state.loadEInvoiceRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadEInvoiceRequest.error = error;
    },
  },
});

export { actions };

export default reducer;
