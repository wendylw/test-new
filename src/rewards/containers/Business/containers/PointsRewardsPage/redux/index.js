import { createSlice } from '@reduxjs/toolkit';
import { showWebProfileForm, hideWebProfileForm } from './thunks';

const initialState = {
  isProfileModalShow: false,
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/pointsRewardsPage',
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
