import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  options: [],
  selectedOptionProvider: null,
  payByCashPromptDisplay: false,
  status: '',
  error: {},
};

const { reducer, actions } = createSlice({
  name: 'ordering/payments/common',
  initialState,
  reducers: {
    // TODO: use createAsyncThunk
    loadPaymentsPending: state => {
      state.status = 'pending';
    },
    loadPaymentsSuccess: (state, { payload }) => {
      if (payload) {
        state.options = payload;
        state.status = 'fulfilled';
      }
    },
    loadPaymentsFailed: (state, { payload }) => {
      if (payload) {
        state.error = payload;
        state.status = 'reject';
      }
    },
    updatePaymentSelected: (state, { payload }) => {
      if (payload) {
        state.selectedOptionProvider = payload;
      }
    },
    updatePayByCashPromptDisplayStatus: (state, { payload }) => {
      state.payByCashPromptDisplay = payload.status;
    },
  },
});

export { actions };

export default reducer;
