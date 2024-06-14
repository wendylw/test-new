import { createSlice } from '@reduxjs/toolkit';
import { showWebProfileForm, hideWebProfileForm } from './thunks';

const initialState = {
  isProfileModalShow: false,
  fetchUniquePromoListBannersLimit: 2,
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
  },
});

export default reducer;
