import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchCashbackHistoryList, fetchStoreCreditsHistoryList } from './thunks';

const initialState = {
  isCashbackPromptDrawerShow: false,
  isStoreCreditsPromptDrawerShow: false,
  loadCashbackHistoryListRequest: {
    data: [],
    status: null,
    error: null,
  },
  loadStoreCreditsHistoryListRequest: {
    data: [],
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/cashbackCreditsHistory',
  initialState,
  reducers: {
    cashbackPromptDrawerShown: state => {
      state.isCashbackPromptDrawerShow = true;
    },
    cashbackPromptDrawerHidden: state => {
      state.isCashbackPromptDrawerShow = false;
    },
    storeCreditsPromptDrawerShown: state => {
      state.isStoreCreditsPromptDrawerShow = true;
    },
    storeCreditsPromptDrawerHidden: state => {
      state.isStoreCreditsPromptDrawerShow = false;
    },
    cashbackCreditsHistoryReset: () => initialState,
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
    [fetchStoreCreditsHistoryList.pending.type]: state => {
      state.loadStoreCreditsHistoryListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadStoreCreditsHistoryListRequest.error = null;
    },
    [fetchStoreCreditsHistoryList.fulfilled.type]: (state, { payload }) => {
      state.loadStoreCreditsHistoryListRequest.data = payload;
      state.loadStoreCreditsHistoryListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadStoreCreditsHistoryListRequest.error = null;
    },
    [fetchStoreCreditsHistoryList.rejected.type]: (state, { error }) => {
      state.loadStoreCreditsHistoryListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadStoreCreditsHistoryListRequest.error = error;
    },
  },
});

export default reducer;
