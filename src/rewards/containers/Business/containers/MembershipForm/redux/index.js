import { createSlice } from '@reduxjs/toolkit';
import { joinNowButtonClicked } from './thunks';

const initialState = {
  isJoinNowButtonDisabled: false,
};

export const { actions, reducer } = createSlice({
  name: 'rewards/business/membershipForm',
  initialState,
  extraReducers: {
    [joinNowButtonClicked.pending.type]: state => {
      state.isJoinNowButtonDisabled = true;
    },
    [joinNowButtonClicked.fulfilled.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [joinNowButtonClicked.rejected.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
  },
});

export default reducer;
