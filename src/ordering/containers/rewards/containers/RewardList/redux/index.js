import { createSlice } from '@reduxjs/toolkit';
import { updateSearchKeyword } from './thunks';

const initialState = {
  searchKeyword: '',
};

export const { reducer, actions } = createSlice({
  name: 'ordering/rewardList',
  initialState,
  reducers: {},
  extraReducers: {
    [updateSearchKeyword.fulfilled.type]: (state, { payload }) => {
      state.searchKeyword = payload;
    },
  },
});

export default reducer;
