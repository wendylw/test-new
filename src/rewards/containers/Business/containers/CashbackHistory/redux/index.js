import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchCashbackHistoryList } from './thunks';

const initialState = {
  isEarnedCashbackPromptDrawerShow: false,
  page: 0,
  limit: 20,
  end: false,
  loadCashbackHistoryListRequest: {
    data: [],
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/pointsHistory',
  initialState,
  reducers: {
    earnedCashbackPromptDrawerShown: state => {
      state.isEarnedCashbackPromptDrawerShow = true;
    },
    earnedCashbackPromptDrawerHidden: state => {
      state.isEarnedCashbackPromptDrawerShow = false;
    },
  },
  extraReducers: {
    [fetchCashbackHistoryList.pending.type]: state => {
      state.loadCashbackHistoryListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadCashbackHistoryListRequest.error = null;
    },
    [fetchCashbackHistoryList.fulfilled.type]: (state, { payload }) => {
      state.end = !!(payload instanceof Array && payload.length < state.limit);
      state.loadCashbackHistoryListRequest.data = state.loadCashbackHistoryListRequest.data.concat(payload || []);
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
