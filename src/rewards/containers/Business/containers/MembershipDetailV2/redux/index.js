import { createSlice } from '@reduxjs/toolkit';
import { showWebProfileForm, hideWebProfileForm, showBackButton } from './thunks';

const initialState = {
  isProfileModalShow: false,
  fetchUniquePromoListBannersLimit: 2,
  shouldShowBackButton: false,
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/membershipDetail',
  initialState,
  extraReducers: {
    [showWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = true;
    },
    [hideWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = false;
    },
    [showBackButton.fulfilled.type]: state => {
      state.shouldShowBackButton = true;
    },
  },
});

export default reducer;
