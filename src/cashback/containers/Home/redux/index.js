import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { fetchCustomerReceiptList } from './thunks';

const initialState = {
  loadCustomerReceiptListRequest: {
    data: null,
    localData: {
      hasMore: true,
    },
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'cashback/claimCashback',
  initialState,
  reducers: {
    resetClaimCashback: () => initialState,
  },
  extraReducers: {
    [fetchCustomerReceiptList.pending.type]: state => {
      state.loadCustomerReceiptListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadCustomerReceiptListRequest.error = null;
    },
    [fetchCustomerReceiptList.fulfilled.type]: (state, { payload }) => {
      const { list = [] } = payload || {};

      state.loadCustomerReceiptListRequest.data = {
        ...state.loadCustomerReceiptListRequest.data,
        list: state.loadCustomerReceiptListRequest.data
          ? state.loadCustomerReceiptListRequest.data.list.concat(list)
          : list,
      };
      state.loadCustomerReceiptListRequest.localData.hasMore = list.length !== 0;
      state.loadCustomerReceiptListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadCustomerReceiptListRequest.error = null;
    },
    [fetchCustomerReceiptList.rejected.type]: (state, { error }) => {
      state.loadCustomerReceiptListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadCustomerReceiptListRequest.error = error;
    },
  },
});

export default reducer;
