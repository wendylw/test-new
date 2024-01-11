import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { updateSharingConsumerInfo } from './thunks';

const initialState = {
  updateSharingConsumerInfo: {
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/seamlessLoyalty',
  initialState,
  reducers: {},
  extraReducers: {
    [updateSharingConsumerInfo.pending.type]: state => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.PENDING;
      state.updateSharingConsumerInfo.error = null;
    },
    [updateSharingConsumerInfo.fulfilled.type]: state => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.updateSharingConsumerInfo.error = null;
    },
    [updateSharingConsumerInfo.rejected.type]: (state, { error }) => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.REJECTED;
      state.updateSharingConsumerInfo.error = error;
    },
  },
});

export default reducer;
