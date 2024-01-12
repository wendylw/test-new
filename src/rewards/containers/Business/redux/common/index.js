import { createSlice } from '@reduxjs/toolkit';
import { confirmToShareConsumerInfo } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

const initialState = {
  confirmSharingConsumerInfoRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'rewards/business/common',
  initialState,
  extraReducers: {
    [confirmToShareConsumerInfo.pending.type]: state => {
      state.confirmSharingConsumerInfoRequest.status = API_REQUEST_STATUS.PENDING;
      state.confirmSharingConsumerInfoRequest.error = null;
    },
    [confirmToShareConsumerInfo.fulfilled.type]: (state, { payload }) => {
      state.confirmSharingConsumerInfoRequest.data = payload;
      state.confirmSharingConsumerInfoRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.confirmSharingConsumerInfoRequest.error = null;
    },
    [confirmToShareConsumerInfo.rejected.type]: (state, { error }) => {
      state.confirmSharingConsumerInfoRequest.status = API_REQUEST_STATUS.REJECTED;
      state.confirmSharingConsumerInfoRequest.error = error;
    },
  },
});

export default reducer;
