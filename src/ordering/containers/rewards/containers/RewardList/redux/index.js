import { createSlice } from '@reduxjs/toolkit';
import { updateSearchKeywordByQuery } from './thunks';

const initialState = {
  searchKeyword: '',
};

export const { reducer, actions } = createSlice({
  name: 'ordering/rewardList',
  initialState,
  reducers: {},
  extraReducers: {
    [updateSearchKeywordByQuery.fulfilled.type]: (state, { payload }) => {
      state.searchKeyword = payload;
    },
  },
});

export default reducer;
