import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions, getUserConsumerId, getStoreId } from '../../../../redux/modules/app';
import { getHasUserSaveStore } from './selectors';
import { getAlcoholConsent, setAlcoholConsent, getStoreSaveStatus, toggleStoreSaveStatus } from './api-request';

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

export const getUserSaveStoreStatus = createAsyncThunk(
  'ordering/home/common/getUserSaveStoreStatus',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);
    const { isFavorite = false } = await getStoreSaveStatus({ consumerId, storeId });
    return isFavorite;
  }
);

// Optimistic update: do not care about the API callback result, just update the status as user expected
export const toggleUserSaveStoreStatus = createAsyncThunk(
  'ordering/home/common/setUserSaveStoreStatus',
  (_, { getState }) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);
    const updatedSaveResult = !getHasUserSaveStore(state);

    toggleStoreSaveStatus({ consumerId, storeId }).catch(error =>
      console.error(`Failed to ${updatedSaveResult ? 'save' : 'unsave'} store: ${error.message}`)
    );

    return updatedSaveResult;
  }
);
