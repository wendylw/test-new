import { createSlice } from '@reduxjs/toolkit';
import { loadConsumerCustomerInfo } from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const initialState = {
  data: {
    customerId: null,
    storeCreditInfo: {
      cashbackClaimCount: 0,
      lastCashbackClaimDate: null,
      storeCreditsBalance: 0,
      storeCreditsSpent: 0,
    },
  },
  status: null,
  error: null,
};

const { reducer, actions } = createSlice({
  name: 'loyalty/customer',
  initialState,
  reducers: {
    consumerCustomerInfoReset: () => initialState,
  },
  extraReducers: {
    [loadConsumerCustomerInfo.pending.type]: state => {
      state.status = API_REQUEST_STATUS.PENDING;
      state.error = null;
    },
    [loadConsumerCustomerInfo.fulfilled.type]: (state, action) => {
      const { customerId, storeCreditInfo } = action.payload;
      const { cashbackClaimCount, lastCashbackClaimDate, storeCreditsBalance, storeCreditsSpent } =
        storeCreditInfo || {};

      state.data.customerId = customerId;
      state.data.storeCreditInfo.cashbackClaimCount = cashbackClaimCount;
      state.data.storeCreditInfo.lastCashbackClaimDate = lastCashbackClaimDate;
      state.data.storeCreditInfo.storeCreditsBalance = storeCreditsBalance;
      state.data.storeCreditInfo.storeCreditsSpent = storeCreditsSpent;

      state.status = API_REQUEST_STATUS.FULFILLED;
      state.error = null;
    },
    [loadConsumerCustomerInfo.rejected.type]: (state, action) => {
      state.status = API_REQUEST_STATUS.REJECTED;
      state.error = action.error;
    },
  },
});

export { actions };

export default reducer;
