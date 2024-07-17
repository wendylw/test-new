import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { resetBusinessFormData, submitBusinessOrderForEInvoice } from './thunks';

const initialState = {
  submitBusinessOrderForEInvoiceRequest: {
    data: null,
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'eInvoice/business/preview',
  initialState,
  reducers: {
    submitMalaysianOrderForEInvoiceErrorReset: state => {
      state.submitBusinessOrderForEInvoiceRequest.error = initialState.submitBusinessOrderForEInvoiceRequest.error;
    },
  },
  extraReducers: {
    [resetBusinessFormData.fulfilled.type]: state => {
      state.submitBusinessOrderForEInvoiceRequest = initialState.submitBusinessOrderForEInvoiceRequest;
    },
    [submitBusinessOrderForEInvoice.pending.type]: state => {
      state.submitBusinessOrderForEInvoiceRequest.status = API_REQUEST_STATUS.PENDING;
      state.submitBusinessOrderForEInvoiceRequest.error = null;
    },
    [submitBusinessOrderForEInvoice.fulfilled.type]: (state, { payload }) => {
      state.submitBusinessOrderForEInvoiceRequest.data = payload;
      state.submitBusinessOrderForEInvoiceRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.submitBusinessOrderForEInvoiceRequest.error = null;
    },
    [submitBusinessOrderForEInvoice.rejected.type]: (state, { error }) => {
      state.submitBusinessOrderForEInvoiceRequest.status = API_REQUEST_STATUS.REJECTED;
      state.submitBusinessOrderForEInvoiceRequest.error = error;
    },
  },
});

export { actions };

export default reducer;
