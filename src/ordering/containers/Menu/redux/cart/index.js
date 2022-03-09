import { createSlice } from '@reduxjs/toolkit';
import { hideMiniCartDrawer, showMiniCartDrawer } from './thunks';

const initialState = {
  miniCartDrawerVisible: false,
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/cart',
  initialState,
  extraReducers: {
    [showMiniCartDrawer.fulfilled.type]: state => {
      state.miniCartDrawerVisible = true;
    },
    [hideMiniCartDrawer.fulfilled.type]: state => {
      state.miniCartDrawerVisible = false;
    },
  },
});

export default reducer;
