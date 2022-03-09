import { createAsyncThunk } from '@reduxjs/toolkit';

export const setPromotionDrawerVisible = createAsyncThunk(
  'ordering/menu/setPromotionDrawerVisible',
  visible => visible
);
