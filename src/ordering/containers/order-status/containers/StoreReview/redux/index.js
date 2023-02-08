import { createSlice } from '@reduxjs/toolkit';
import { initOffline } from './thunks';

const initialState = {
  offline: false,
};

export const { actions, reducer } = createSlice({
  name: 'ordering/orderStatus/storeReview',
  initialState,
  extraReducers: {
    [initOffline.fulfilled.type]: (state, { payload }) => {
      const { offline } = payload;
      state.offline = offline;
    },
  },
});

export default reducer;
