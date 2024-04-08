import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchCashbackHistoryList } from './thunks';

const initialState = {
  isUseCashbackPromptDrawerShow: false,
  isUseStoreCreditsPromptDrawerShow: false,
  loadCashbackCreditsHistoryListRequest: {
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
    [fetchCashbackCreditsHistoryList.pending.type]: state => {
      state.loadCashbackCreditsHistoryListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadCashbackCreditsHistoryListRequest.error = null;
    },
    [fetchCashbackCreditsHistoryList.fulfilled.type]: (state, { payload }) => {
      state.loadCashbackCreditsCreditsHistoryListRequest.end = isEnded;
      state.loadCashbackCreditsHistoryListRequest.data = state.loadCashbackCreditsHistoryListRequest.data.concat(
        payload || []
      );
      state.loadCashbackCreditsHistoryListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadCashbackCreditsHistoryListRequest.error = null;
    },
    [fetchCashbackCreditsHistoryList.rejected.type]: (state, { error }) => {
      state.loadCashbackCreditsHistoryListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadCashbackCreditsHistoryListRequest.error = error;
    },
  },
});

export default reducer;
