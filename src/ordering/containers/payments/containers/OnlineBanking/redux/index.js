import { createSlice } from '@reduxjs/toolkit';
import { actions as commonActions } from '../../../redux/common/';

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
    [commonActions.loadPaymentsSuccess]: (state, { payload }) => {
      const paymentOptions = payload;
      const onlineBankingOption = paymentOptions.find(payment => payment.key === 'OnlineBanking');
      if (onlineBankingOption) {
        const selectedOnlineBanking = onlineBankingOption.agentCodes.find(banking => banking.agentCode);
        if (selectedOnlineBanking) {
          state.selectedOnlineBankingAgentCode = selectedOnlineBanking.agentCode;
        }
      }
    },
  },
});

export { actions };

export default reducer;
