import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchBox: {
    isEmpty: true,
    error: null,
  },
  selectedReward: {
    id: null,
    uniquePromotionCodeId: null,
    code: null,
    type: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/rewardList',
  initialState,
  reducers: {
    selectedRewardUpdated: (state, { payload }) => {
      state.selectedReward.id = payload.id;
      state.selectedReward.uniquePromotionCodeId = payload.uniquePromotionCodeId;
      state.selectedReward.code = payload.code;
      state.selectedReward.type = payload.type;
    },
    setIsSearchBoxEmpty: (state, { payload }) => {
      state.searchBox.isEmpty = payload;
    },
    searchBoxErrorUpdate: (state, { payload }) => {
      state.searchBox.error = payload;
    },
  },
  extraReducers: {},
});

export default reducer;
