import { createSlice } from '@reduxjs/toolkit';
import { loadConsumerCustomerInfo } from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const initialState = {
  data: {
    customerId: null,
    storeCreditsBalance: 0,
  },
  loadable: false,
  status: null,
  error: null,
};

const { reducer, actions } = createSlice({
  name: 'loyalty/customer',
  initialState,
  reducers: {
    loadableUpdate: (state, action) => {
      state.loadable = action.payload;
    },
    consumerCustomerInfoReset: () => initialState,
  },
  extraReducers: {
    [loadConsumerCustomerInfo.pending.type]: state => {
      state.status = API_REQUEST_STATUS.PENDING;
      state.error = null;
    },
    [loadConsumerCustomerInfo.fulfilled.type]: (state, action) => {
      const { customerId, storeCreditsBalance } = action.payload;

      state.data.customerId = customerId;
      state.data.storeCreditsBalance = storeCreditsBalance;

      state.loadable = false;
      state.status = API_REQUEST_STATUS.FULFILLED;
      state.error = null;
    },
    [loadConsumerCustomerInfo.rejected.type]: (state, action) => {
      state.loadable = false;
      state.status = API_REQUEST_STATUS.REJECTED;
      state.error = action.error;
    },
  },
});

export { actions };

export default reducer;
