import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';

const initialState = {
  updateSharingConsumerInfo: {
    status: null,
    error: null,
  },
  confirmSharingConsumerInfo: {
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/seamlessLoyalty',
  initialState,
  reducers: {},
  extraReducers: {},
});

export default reducer;
