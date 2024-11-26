import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
  },
  extraReducers: {},
});

export default reducer;
