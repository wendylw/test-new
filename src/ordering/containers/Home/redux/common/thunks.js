import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions } from '../../../../redux/modules/app';
import { getAlcoholConsent, setAlcoholConsent } from './api-request';

export const showProductDetail = createAsyncThunk(
  'ordering/home/common/showProductDetail',
  async ({ productId, categoryId }, { dispatch }) => {
    await dispatch(appActions.loadProductDetail(productId));

    return {
      productId,
      categoryId,
    };
  }
);

export const getUserAlcoholConsent = createAsyncThunk('ordering/home/common/getUserAlcoholConsent', async () => {
  const { alcoholConsentTime = null } = await getAlcoholConsent();
  return alcoholConsentTime;
});

// Optimistic update: do not care about the API callback result, just confirm alcohol consent
export const setUserAlcoholConsent = createAsyncThunk('ordering/home/common/setUserAlcoholConsent', () => {
  setAlcoholConsent().catch(() => {});
  return true;
});
