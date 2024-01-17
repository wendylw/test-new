import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { claimUniquePromo } from './thunks';

const initialState = {
  claimUniquePromoRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/claimUniquePromo',
  initialState,
  reducers: {},
  extraReducers: {
    [claimUniquePromo.pending.type]: state => {
      state.claimUniquePromoRequest.status = API_REQUEST_STATUS.PENDING;
      state.claimUniquePromoRequest.error = null;
    },
    [claimUniquePromo.fulfilled.type]: (state, { payload }) => {
      state.claimUniquePromoRequest.data = payload;
      state.claimUniquePromoRequest.status = API_REQUEST_STATUS.SUCCESS;
      state.claimUniquePromoRequest.error = null;
    },
    [claimUniquePromo.rejected.type]: (state, { error }) => {
      state.claimUniquePromoRequest.status = API_REQUEST_STATUS.ERROR;
      state.claimUniquePromoRequest.error = error;
    },
  },
});

export default reducer;
