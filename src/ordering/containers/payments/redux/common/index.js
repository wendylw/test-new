import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  options: [],
  selectedOptionProvider: null,
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
  },
});

export { actions };

export default reducer;
