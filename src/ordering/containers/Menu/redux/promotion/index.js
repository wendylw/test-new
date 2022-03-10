import { createSlice } from '@reduxjs/toolkit';
import { setPromotionDrawerVisible } from './thunks';

const initialState = {
  promotionDrawerVisible: false,
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/promotion',
  initialState,
  reducers: {},
  extraReducers: {
    [setPromotionDrawerVisible.fulfilled.type]: (state, { payload }) => {
      state.promotionDrawerVisible = payload;
    },
  },
});

export default reducer;
