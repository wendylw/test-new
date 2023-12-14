import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { fetchPromoList } from './thunks';

const initialState = {
  loadPromoListRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/membershipDetail',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchPromoList.pending.type]: state => {
      state.loadPromoListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadPromoListRequest.error = null;
    },
    [fetchPromoList.fulfilled.type]: (state, { payload }) => {
      state.loadPromoListRequest.status = API_REQUEST_STATUS.SUCCESS;
      state.loadPromoListRequest.data = payload;
      state.loadPromoListRequest.error = null;
    },
    [fetchPromoList.rejected.type]: (state, { error }) => {
      state.loadPromoListRequest.status = API_REQUEST_STATUS.ERROR;
      state.loadPromoListRequest.error = error;
    },
  },
});

export default reducer;
