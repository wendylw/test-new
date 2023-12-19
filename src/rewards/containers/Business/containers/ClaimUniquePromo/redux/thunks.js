import { createAsyncThunk } from '@reduxjs/toolkit';
import { postClaimUniquePromo } from './api-request';

export const claimUniquePromo = createAsyncThunk(
  'rewards/business/claimUniquePromo/claimUniquePromo',
  async (_, { getState }) => {
    const state = getState();
    const rewardsSetId = getUniquePromoRewardsSetId(state);
    const result = await postClaimUniquePromo({
      id: rewardsSetId,
    });

    return result;
  }
);
