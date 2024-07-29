import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { fetchUniquePromosAvailableCount } from './thunks';

const initialState = {
  loadUniquePromosAvailableCountRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/rewards',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchUniquePromosAvailableCount.pending.type]: state => {
      state.loadUniquePromosAvailableCountRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadUniquePromosAvailableCountRequest.error = null;
    },
    [fetchUniquePromosAvailableCount.fulfilled.type]: (state, { payload }) => {
      state.loadUniquePromosAvailableCountRequest.data = payload;
      state.loadUniquePromosAvailableCountRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadUniquePromosAvailableCountRequest.error = null;
    },
    [fetchUniquePromosAvailableCount.rejected.type]: (state, { error }) => {
      state.loadUniquePromosAvailableCountRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadUniquePromosAvailableCountRequest.error = error;
    },
  },
});

export default reducer;
