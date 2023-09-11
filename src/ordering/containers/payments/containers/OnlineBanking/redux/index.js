import { createSlice } from '@reduxjs/toolkit';
import { loadPaymentOptions } from '../../../redux/common/thunks';

const initialState = {
  selectedOnlineBankingAgentCode: null,
};

const { reducer, actions } = createSlice({
  name: 'ordering/payments/onlineBanking',
  initialState,
  reducers: {
    updateBankingSelected: (state, { payload }) => {
      if (payload) {
        state.selectedOnlineBankingAgentCode = payload;
      }
    },
  },
  extraReducers: {
    [loadPaymentOptions.fulfilled]: (state, { payload }) => {
      const { paymentOptions } = payload;
      const onlineBankingOption = paymentOptions.find(payment => payment.key === 'OnlineBanking');
      if (onlineBankingOption) {
        const selectedOnlineBanking = onlineBankingOption.agentCodes.find(
          banking => banking.agentCode && banking.available
        );
        if (selectedOnlineBanking) {
          state.selectedOnlineBankingAgentCode = selectedOnlineBanking.agentCode;
        }
      }
    },
  },
});

export { actions };

export default reducer;
