import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchPointsHistoryList } from './thunks';

const initialState = {
  isEarnedPointsPromptDrawerShow: false,
  loadPointsHistoryListRequest: {
    data: [],
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/pointsHistory',
  initialState,
  reducers: {
    earnedPointsPromptDrawerShown: state => {
      state.isEarnedPointsPromptDrawerShow = true;
    },
    earnedPointsPromptDrawerHidden: state => {
      state.isEarnedPointsPromptDrawerShow = false;
    },
  },
  extraReducers: {
    [fetchPointsHistoryList.pending.type]: state => {
      state.loadPointsHistoryListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadPointsHistoryListRequest.error = null;
    },
    [fetchPointsHistoryList.fulfilled.type]: (state, { payload }) => {
      state.loadPointsHistoryListRequest.data = state.loadPointsHistoryListRequest.data.concat(payload || []);
      state.loadPointsHistoryListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadPointsHistoryListRequest.error = null;
    },
    [fetchPointsHistoryList.rejected.type]: (state, { error }) => {
      state.loadPointsHistoryListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadPointsHistoryListRequest.error = error;
    },
  },
});

export default reducer;
