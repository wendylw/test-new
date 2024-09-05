import { createSlice } from '@reduxjs/toolkit';
import { mounted } from './thunks';

const initialState = {
  source: null,
};

export const { reducer, actions } = createSlice({
  name: 'rewards/common',
  initialState,
  extraReducers: {
    [mounted.fulfilled.type]: (state, { payload }) => {
      state.source = payload.source;
    },
  },
});

export default reducer;
