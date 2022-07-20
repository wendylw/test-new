import _isEmpty from 'lodash/isEmpty';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActionCreators, getStoresList } from '../../../../redux/modules/app';
import { refreshMenuPageForNewStore } from '../common/thunks';

/**
 * Store branch drawer shown
 */
export const storeDrawerShown = createAsyncThunk(
  'ordering/menu/stores/storeDrawerShown',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const storeList = getStoresList(state);

    // Because this thunk is only called from the store list slide-up page, we probably don't need to fetch the core store API again for better performance.
    if (_isEmpty(storeList)) {
      await dispatch(appActionCreators.loadCoreStores());
    }
  }
);

export const storeDrawerHidden = createAsyncThunk('ordering/menu/stores/storeDrawerHidden', async () => {});

/**
 * select store from the store branch drawer
 */
export const selectStoreBranch = createAsyncThunk(
  'ordering/menu/stores/selectStoreBranch',
  async (storeId, { dispatch }) => dispatch(refreshMenuPageForNewStore(storeId))
);
