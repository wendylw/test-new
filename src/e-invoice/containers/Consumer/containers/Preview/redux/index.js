import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import {
  resetConsumerMalaysianFormData,
  resetConsumerNonMalaysianFormData,
  submitConsumerMalaysianOrderForEInvoice,
  submitConsumerNonMalaysianOrderForEInvoice,
} from './thunks';

const initialState = {
  submitMalaysianOrderForEInvoiceRequest: {
    data: null,
    status: null,
    error: null,
  },
  submitNonMalaysianOrderForEInvoiceRequest: {
    data: null,
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'eInvoice/consumer/preview',
  initialState,
  reducers: {
    submitMalaysianOrderForEInvoiceErrorReset: state => {
      state.submitMalaysianOrderForEInvoiceRequest.error = initialState.submitMalaysianOrderForEInvoiceRequest.error;
    },
    submitNonMalaysianOrderForEInvoiceErrorReset: state => {
      state.submitNonMalaysianOrderForEInvoiceRequest.error =
        initialState.submitNonMalaysianOrderForEInvoiceRequest.error;
    },
  },
  extraReducers: {
    [resetConsumerMalaysianFormData.fulfilled.type]: state => {
      state.submitMalaysianOrderForEInvoiceRequest = initialState.submitMalaysianOrderForEInvoiceRequest;
    },
    [resetConsumerNonMalaysianFormData.fulfilled.type]: state => {
      state.submitNonMalaysianOrderForEInvoiceRequest = initialState.submitNonMalaysianOrderForEInvoiceRequest;
    },
    [submitConsumerMalaysianOrderForEInvoice.pending.type]: state => {
      state.submitMalaysianOrderForEInvoiceRequest.status = API_REQUEST_STATUS.PENDING;
      state.submitMalaysianOrderForEInvoiceRequest.error = null;
    },
    [submitConsumerMalaysianOrderForEInvoice.fulfilled.type]: (state, { payload }) => {
      state.submitMalaysianOrderForEInvoiceRequest.data = payload;
      state.submitMalaysianOrderForEInvoiceRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.submitMalaysianOrderForEInvoiceRequest.error = null;
    },
    [submitConsumerMalaysianOrderForEInvoice.rejected.type]: (state, { error }) => {
      state.submitMalaysianOrderForEInvoiceRequest.status = API_REQUEST_STATUS.REJECTED;
      state.submitMalaysianOrderForEInvoiceRequest.error = error;
    },
    [submitConsumerNonMalaysianOrderForEInvoice.pending.type]: state => {
      state.submitNonMalaysianOrderForEInvoiceRequest.status = API_REQUEST_STATUS.PENDING;
      state.submitNonMalaysianOrderForEInvoiceRequest.error = null;
    },
    [submitConsumerNonMalaysianOrderForEInvoice.fulfilled.type]: (state, { payload }) => {
      state.submitNonMalaysianOrderForEInvoiceRequest.data = payload;
      state.submitNonMalaysianOrderForEInvoiceRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.submitNonMalaysianOrderForEInvoiceRequest.error = null;
    },
    [submitConsumerNonMalaysianOrderForEInvoice.rejected.type]: (state, { error }) => {
      state.submitNonMalaysianOrderForEInvoiceRequest.status = API_REQUEST_STATUS.REJECTED;
      state.submitNonMalaysianOrderForEInvoiceRequest.error = error;
    },
  },
});

export { actions };

export default reducer;
