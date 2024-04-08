import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchCashbackHistoryList, fetchStoreCreditsHistoryList } from './thunks';

const initialState = {
  isUseCashbackPromptDrawerShow: false,
  isUseStoreCreditsPromptDrawerShow: false,
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
    useCashbackPromptDrawerShown: state => {
      state.isUseCashbackPromptDrawerShow = true;
    },
    useCashbackPromptDrawerHidden: state => {
      state.isUseCashbackPromptDrawerShow = false;
    },
    useStoreCreditsPromptDrawerShown: state => {
      state.isUseStoreCreditsPromptDrawerShow = true;
    },
    useStoreCreditsPromptDrawerHidden: state => {
      state.isUseStoreCreditsPromptDrawerShow = false;
    },
  },
  extraReducers: {
    [fetchCashbackHistoryList.pending.type]: state => {
      state.loadCashbackHistoryListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadCashbackHistoryListRequest.error = null;
    },
    [fetchCashbackHistoryList.fulfilled.type]: (state, { payload }) => {
      state.loadCashbackHistoryListRequest.data = state.loadCashbackHistoryListRequest.data.concat(payload || []);
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
      state.loadStoreCreditsHistoryListRequest.data = state.loadStoreCreditsHistoryListRequest.data.concat(
        payload || []
      );
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
