import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchUniquePromoDetail } from './thunks';

const initialState = {
  loadUniquePromoDetailRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/uniquePromoDetail',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchUniquePromoDetail.pending.type]: state => {
      state.loadUniquePromoDetailRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadUniquePromoDetailRequest.error = null;
    },
    [fetchUniquePromoDetail.fulfilled.type]: (state, { payload }) => {
      state.loadUniquePromoDetailRequest.data = payload;
      state.loadUniquePromoDetailRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadUniquePromoDetailRequest.error = null;
    },
    [fetchUniquePromoDetail.rejected.type]: (state, { error }) => {
      state.loadUniquePromoDetailRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadUniquePromoDetailRequest.error = error;
    },
  },
});

export default reducer;
