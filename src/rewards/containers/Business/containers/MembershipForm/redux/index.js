import { createSlice } from '@reduxjs/toolkit';
import { joinNowButtonClicked, showProfileForm, hideProfileForm, joinBusinessMembership } from './thunks';

const initialState = {
  isProfileFormVisible: false,
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
    [joinBusinessMembership.pending.type]: state => {
      state.isJoinNowButtonDisabled = true;
    },
    [joinBusinessMembership.fulfilled.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [joinBusinessMembership.rejected.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [showProfileForm.fulfilled.type]: state => {
      state.isProfileFormVisible = true;
    },
    [hideProfileForm.fulfilled.type]: state => {
      state.isProfileFormVisible = false;
    },
  },
});

export default reducer;
