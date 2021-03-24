import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  options: [],
  selectedOptionProvider: null,
  selectedOnlineBankingAgentCode: null,
  status: '',
  error: {},
};

const { reducer, actions } = createSlice({
  name: 'payments/common',
  initialState,
  reducers: {
    // TODO: use
    loadPayments: state => {
      state.status = 'pending';
    },
    loadPaymentsSuccess: (state, { payload }) => {
      if (payload.data) {
        state.options = payload.data;
        state.status = 'fulfilled';
      }
    },
    loadPaymentsFailed: (state, { payload }) => {
      if (payload.error) {
        state.error = payload.error;
        state.status = 'reject';
      }
    },
    loadSavedCards: state => {},
    loadSavedCardsSuccess: state => {},
    loadSavedCardsFailed: state => {},
    updatePaymentSelected: (state, { payload }) => {
      if (payload.data) {
        state.selectedOptionProvider = payload.data;
      }
    },
    updateBankingSelected: (state, { payload }) => {
      if (payload.data) {
        state.selectedOnlineBankingAgentCode = payload.data;
      }
    },
  },
});

export { actions };

export default reducer;
