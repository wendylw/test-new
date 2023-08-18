import { createSlice } from '@reduxjs/toolkit';
import { loadFeatureFlags, refreshFeatureFlags, updateFeatureFlagResults } from './thunks';
import { API_REQUEST_STATUS } from '../../../utils/constants';

const initialState = {
  featureFlagInfo: {
    data: {},
    loadDataRequest: {
      status: null,
      error: null,
    },
  },
};

const { reducer, actions } = createSlice({
  name: 'app/growthbook',
  initialState,
  reducers: {},
  extraReducers: {
    [loadFeatureFlags.pending.type]: state => {
      state.featureFlagInfo.loadDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.featureFlagInfo.loadDataRequest.error = null;
    },
    [loadFeatureFlags.fulfilled.type]: state => {
      state.featureFlagInfo.loadDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.featureFlagInfo.loadDataRequest.error = null;
    },
    [loadFeatureFlags.rejected.type]: (state, { error }) => {
      state.featureFlagInfo.loadDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.featureFlagInfo.loadDataRequest.error = error;
    },
    [refreshFeatureFlags.pending.type]: state => {
      state.featureFlagInfo.loadDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.featureFlagInfo.loadDataRequest.error = null;
    },
    [refreshFeatureFlags.fulfilled.type]: state => {
      state.featureFlagInfo.loadDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.featureFlagInfo.loadDataRequest.error = null;
    },
    [refreshFeatureFlags.rejected.type]: (state, { error }) => {
      state.featureFlagInfo.loadDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.featureFlagInfo.loadDataRequest.error = error;
    },
    [updateFeatureFlagResults.fulfilled.type]: (state, { payload }) => {
      state.featureFlagInfo.data = payload;
    },
  },
});

export default reducer;
export { actions };
