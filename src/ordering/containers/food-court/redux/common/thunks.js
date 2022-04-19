import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFoodCourtId } from './selectors';
import { fetchFoodCourtStoreList } from './api-request';

/**
 * Ordering Menu page mounted
 */
export const mounted = createAsyncThunk('ordering/foodCourt/common/mounted', async (_, { getState }) => {
  // - Load store List of this food court

  const state = getState();
  const foodCourtId = getFoodCourtId(state);

  try {
    const foodCourtStoreList = await fetchFoodCourtStoreList(foodCourtId);

    return foodCourtStoreList;
  } catch (e) {
    console.error('load store list failed on food court landing page');

    throw e;
  }
});
