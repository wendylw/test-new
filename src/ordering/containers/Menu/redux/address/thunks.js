import i18next from 'i18next';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isNumber from 'lodash/isNumber';
import _isEqual from 'lodash/isEqual';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAddressInfo } from '../../../../../redux/modules/address/selectors';
import { setAddressInfo } from '../../../../../redux/modules/address/thunks';
import { getBusinessByName } from '../../../../../redux/modules/entities/businesses';
import { getCoreStoreList } from '../../../../../redux/modules/entities/stores';
import {
  getStoreId,
  getBusiness,
  getDeliveryRadius,
  getMerchantCountry,
  actions as appActionCreators,
} from '../../../../redux/modules/app';
import { refreshMenuPageForNewStore, hideLocationDrawer } from '../common/thunks';
import { getNearestStore, getIsAddressOutOfRange } from '../common/selectors';

export const showErrorToast = createAsyncThunk('ordering/menu/address/showErrorToast', async message => ({ message }));

export const clearErrorToast = createAsyncThunk('ordering/menu/address/clearErrorToast', async () => {});

export const checkDeliveryRange = createAsyncThunk(
  'ordering/menu/address/checkDeliveryRange',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const isAddressOutOfRange = getIsAddressOutOfRange(state);

    if (!isAddressOutOfRange) return;

    const deliveryRadius = getDeliveryRadius(state);
    const errorMessage = i18next.t('OrderingDelivery:OutOfDeliveryRange', { distance: deliveryRadius });

    await dispatch(showErrorToast(errorMessage));
  }
);

/**
 * Location drawer shown
 */
export const locationDrawerShown = createAsyncThunk(
  'ordering/menu/address/locationDrawerShown',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const storeId = getStoreId(state);
    const business = getBusiness(state);

    await dispatch(checkDeliveryRange());

    try {
      if (_isEmpty(business)) return {};

      // Has checked with Luke, because this thunk is only called from the address slide-up page, we probably don't need to fetch the core business API again for better performance.
      let businessInfo = getBusinessByName(state, business);

      if (_isEmpty(businessInfo)) {
        await dispatch(appActionCreators.loadCoreBusiness());
        businessInfo = getBusinessByName(getState(), business);
      }

      const store = _get(businessInfo, 'stores.[0]', {});
      const country = getMerchantCountry(getState());
      const deliveryRadius = getDeliveryRadius(getState());

      if (!_isNumber(deliveryRadius)) {
        throw new Error('delivery radius is incorrect.');
      }

      if (_isEmpty(storeId)) {
        return {
          country,
          radius: deliveryRadius * 1000,
        };
      }

      // FB-4039: we need to be aware that there is a possibility that the store cannot be found.
      // This issue has already been raised in production and we should take time to further investigate.
      if (_isEmpty(store)) {
        throw new Error('store is not found.');
      }

      const coords = {
        lat: _get(store, 'location.latitude', null),
        lng: _get(store, 'location.longitude', null),
      };

      if (!_isNumber(coords.lat) || !_isNumber(coords.lng)) {
        throw new Error('store coordination is incorrect.');
      }

      return {
        coords,
        country,
        radius: deliveryRadius * 1000,
      };
    } catch (e) {
      console.error(`Failed to load storeInfo: ${e.message}`);
      return {};
    }
  }
);

export const locationDrawerHidden = createAsyncThunk('ordering/menu/address/locationDrawerHidden', async () => {});

/**
 * select location from the location drawer
 */
export const selectLocation = createAsyncThunk(
  'ordering/menu/address/selectLocation',
  async (addressInfo, { dispatch, getState }) => {
    const state = getState();
    const prevAddressInfo = getAddressInfo(state);
    const deliveryRadius = getDeliveryRadius(state);

    if (_isEqual(prevAddressInfo, addressInfo)) {
      await dispatch(hideLocationDrawer());
      return;
    }

    const address = {
      location: {
        longitude: _get(addressInfo, 'coords.lng', 0),
        latitude: _get(addressInfo, 'coords.lat', 0),
      },
    };

    try {
      if (_isEmpty(addressInfo.coords)) {
        throw new Error(i18next.t('OrderingDelivery:AddressNotFound'));
      }

      /**
       * If the selected location is out of the delivery ranges of all stores, pop up an error toast to hint users.
       * Leave a comment for newcomers:
       * we need to fetch core store API every time to get the latest store list since this is the only way to make sure the selected location is within the delivery range.
       */
      await dispatch(appActionCreators.loadCoreStores(address));

      const stores = getCoreStoreList(getState());

      if (_isEmpty(stores)) {
        const errorMessage = i18next.t('OrderingDelivery:OutOfDeliveryRange', { distance: deliveryRadius.toFixed(1) });
        throw new Error(errorMessage);
      }

      /**
       * After the user selects the new valid location, there are 3 things that need to be done:
       * 1. Sync up current address info with the BFF
       * 2. Find the nearest available store
       * 3. Update the store id by hard-refreshing menu page
       */
      await dispatch(setAddressInfo(addressInfo));

      const store = getNearestStore(getState());
      const storeId = _get(store, 'id', null);

      if (_isEmpty(storeId)) {
        const errorMessage = i18next.t('OrderingDelivery:OutOfDeliveryRange', { distance: deliveryRadius.toFixed(1) });
        throw new Error(errorMessage);
      }

      const storeHashCode = _get(store, 'hash', null);

      await dispatch(refreshMenuPageForNewStore(storeHashCode));
    } catch (e) {
      console.error(`Failed to change store: ${e.message}`);
      await dispatch(showErrorToast(e.message));
    }
  }
);
