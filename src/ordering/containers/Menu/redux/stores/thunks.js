import i18next from 'i18next';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  actions as appActionCreators,
  getStoresList,
  getStoreId,
  getStoreInfoForCleverTap,
} from '../../../../redux/modules/app';
import { hideStoreListDrawer, changeStore } from '../common/thunks';
import Clevertap from '../../../../../utils/clevertap';
import { toast } from '../../../../../common/utils/feedback';
import logger from '../../../../../utils/monitoring/logger';

/**
 * Store branch drawer shown
 */
export const storeDrawerShown = createAsyncThunk(
  'ordering/menu/stores/storeDrawerShown',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const storeList = getStoresList(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Store List - View page', storeInfoForCleverTap);

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
export const storeBranchSelected = createAsyncThunk(
  'ordering/menu/stores/storeBranchSelected',
  async (storeId, { getState, dispatch }) => {
    const state = getState();
    const currentStoreId = getStoreId(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    if (_isEqual(currentStoreId, storeId)) {
      await dispatch(hideStoreListDrawer());
      return;
    }

    Clevertap.pushEvent('Store List - Select different store branch', storeInfoForCleverTap);

    try {
      await dispatch(changeStore(storeId)).unwrap();
      await dispatch(appActionCreators.loadDeliveryAddressDetailsIfNeeded());
      await dispatch(hideStoreListDrawer());
    } catch (e) {
      toast(i18next.t('SelectStoreErrorMessage'), { type: 'error' });

      logger.error('Ordering_Menu_SelectStoreBranchFailed', { message: e?.message });
      throw e;
    }
  }
);
