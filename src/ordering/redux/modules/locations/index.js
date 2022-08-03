/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import { loadLocationHistoryList, updateLocationToHistoryList } from './thunks';

const initialState = {
  listInfo: {
    data: [],
    status: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'app/location',
  initialState,
  reducers: {},
  extraReducers: {
    [loadLocationHistoryList.pending.type]: state => {
      state.listInfo.status = API_REQUEST_STATUS.PENDING;
    },
    [loadLocationHistoryList.fulfilled.type]: (state, { payload }) => {
      state.listInfo.data = payload;
      state.listInfo.status = API_REQUEST_STATUS.FULFILLED;
    },
    [loadLocationHistoryList.rejected.type]: state => {
      state.listInfo.data = [];
      state.listInfo.status = API_REQUEST_STATUS.REJECTED;
    },
    [updateLocationToHistoryList.pending.type]: state => {
      state.listInfo.status = API_REQUEST_STATUS.PENDING;
    },
  },
});

export default reducer;
export { actions };
