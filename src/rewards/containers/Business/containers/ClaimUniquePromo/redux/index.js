import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { claimUniquePromo } from './thunks';

const initialState = {
  claimPromoRequest: {
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
      state.claimPromoRequest.status = API_REQUEST_STATUS.PENDING;
      state.claimPromoRequest.error = null;
    },
    [claimUniquePromo.fulfilled.type]: (state, { payload }) => {
      state.claimPromoRequest.data = payload;
      state.claimPromoRequest.status = API_REQUEST_STATUS.SUCCESS;
      state.claimPromoRequest.error = null;
    },
    [claimUniquePromo.rejected.type]: (state, { error }) => {
      state.claimPromoRequest.status = API_REQUEST_STATUS.ERROR;
      state.claimPromoRequest.error = error;
    },
  },
});

export default reducer;
