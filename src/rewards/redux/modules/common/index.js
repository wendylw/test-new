import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const { reducer, actions } = createSlice({
  name: 'rewards/common',
  initialState,
});

export default reducer;
