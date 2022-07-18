/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import { loadLocationHistoryList, updateLocationToHistoryList, loadLocationOfDevice } from './thunks';

const initialState = {
  locationList: [],
  loadLocationListStatus: null,
  locationOfDevice: {},
  error: null,
};

const { reducer, actions } = createSlice({
  name: 'app/location',
  initialState,
  reducers: {},
  extraReducers: {
    [loadLocationHistoryList.pending.type]: state => {
      state.loadLocationListStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadLocationHistoryList.fulfilled.type]: (state, { payload }) => {
      state.locationList = payload;
      state.loadLocationListStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [loadLocationHistoryList.rejected.type]: state => {
      state.locationList = [];
      state.loadLocationListStatus = API_REQUEST_STATUS.REJECTED;
    },
    [updateLocationToHistoryList.pending.type]: state => {
      state.loadLocationListStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadLocationOfDevice.fulfilled.type]: (state, { payload }) => {
      state.locationOfDevice = payload;
      state.error = null;
    },
  },
});

export default reducer;
export { actions };
