/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../utils/constants';
import { fetchMerchantInfo } from './thunks';

const initialState = {
  loadMerchantRequest: {
    data: null,
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'app/merchant',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchMerchantInfo.pending.type]: state => {
      state.loadMerchantRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadMerchantRequest.error = null;
    },
    [fetchMerchantInfo.fulfilled.type]: (state, { payload }) => {
      state.loadMerchantRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadMerchantRequest.data = payload;
    },
    [fetchMerchantInfo.rejected.type]: (state, { error }) => {
      state.loadMerchantRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadMerchantRequest.error = error;
    },
  },
});

export default reducer;
export { actions };
