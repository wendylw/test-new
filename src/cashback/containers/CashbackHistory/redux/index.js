import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { fetchCashbackHistoryList } from './thunks';

const initialState = {
  loadCashbackHistoryListRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'cashback/cashbackHistory',
  initialState,
  reducers: {
    resetClaimCashback: () => initialState,
  },
  extraReducers: {
    [fetchCashbackHistoryList.pending.type]: state => {
      state.loadCashbackHistoryListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadCashbackHistoryListRequest.error = null;
    },
    [fetchCashbackHistoryList.fulfilled.type]: (state, { payload }) => {
      state.loadCashbackHistoryListRequest.data = payload;
      state.loadCashbackHistoryListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadCashbackHistoryListRequest.error = null;
    },
    [fetchCashbackHistoryList.rejected.type]: (state, { error }) => {
      state.loadCashbackHistoryListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadCashbackHistoryListRequest.error = error;
    },
  },
});

export default reducer;
