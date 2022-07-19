import _get from 'lodash/get';
import _debounce from 'lodash/debounce';
import _isEmpty from 'lodash/isEmpty';
import _isNumber from 'lodash/isNumber';
import _isEqual from 'lodash/isEqual';
import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { getAddressInfo } from '../../../../../redux/modules/address/selectors';
import { setAddressInfo } from '../../../../../redux/modules/address/thunks';
import { getBusinessByName } from '../../../../../redux/modules/entities/businesses';
import { getCoreStoreList } from '../../../../../redux/modules/entities/stores';
import {
  getStoreId,
  getBusiness,
  getDeliveryRadius,
  getMerchantCountry,
  getBusinessUTCOffset,
  actions as appActionCreators,
} from '../../../../redux/modules/app';
import { loadAddressList } from '../../../../redux/modules/addressList/thunks';
import {
  loadLocationHistoryList,
  loadSearchLocationList,
  updateLocationToHistoryList,
  loadPlaceInfoById,
} from '../../../../redux/modules/locations/thunks';
import { refreshMenuPageForNewStore, hideLocationDrawer } from '../common/thunks';
import { getIsAddressOutOfRange } from '../common/selectors';
import { getStoreInfoData } from './selectors';
import { findNearestAvailableStore } from '../../../../../utils/store-utils';
import { LOCATION_SELECTION_REASON_CODES as ERROR_CODES } from '../../../../../utils/constants';
import logger from '../../../../../utils/monitoring/logger';

export const showErrorToast = createAsyncThunk('ordering/menu/address/showErrorToast', async errorCode => ({
  errorCode,
}));

export const clearErrorToast = createAsyncThunk('ordering/menu/address/clearErrorToast', async () => {});

export const checkDeliveryRange = createAsyncThunk(
  'ordering/menu/address/checkDeliveryRange',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const isAddressOutOfRange = getIsAddressOutOfRange(state);

    if (!isAddressOutOfRange) return;

    await dispatch(showErrorToast(ERROR_CODES.OUT_OF_DELIVERY_RANGE));
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
      logger.error(`Failed to load storeInfo: ${e.message}`);
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
  async ({ addressInfo, date = new Date() }, { dispatch, getState }) => {
    console.log(addressInfo);
    const state = getState();
    const prevAddressInfo = getAddressInfo(state);

    if (_isEqual(prevAddressInfo, addressInfo)) {
      await dispatch(hideLocationDrawer());
      return;
    }

    /**
     * After the user selects the new valid location, there are 3 things that need to be done:
     * 1. Find the nearest available store
     * 2. Sync up current address info with the BFF
     * 3. Update the store id by hard-refreshing menu page
     */
    try {
      const coords = _get(addressInfo, 'coords', null);

      if (_isEmpty(coords)) {
        throw new Error({
          code: ERROR_CODES.ADDRESS_NOT_FOUND,
          reason: 'address coordination is not found',
        });
      }

      let stores = getCoreStoreList(state);
      const utcOffset = getBusinessUTCOffset(state);

      if (_isEmpty(stores)) {
        // We only fetch the core store API again when the previous call hasn't been completed or sent yet for better performance
        await dispatch(appActionCreators.loadCoreStores());
        stores = getCoreStoreList(getState());
      }

      const { store } = findNearestAvailableStore(stores, {
        coords,
        date,
        utcOffset,
      });

      if (_isEmpty(store)) {
        throw new Error({
          code: ERROR_CODES.OUT_OF_DELIVERY_RANGE,
          reason: 'no available store according to the current time or delivery range',
        });
      }

      await dispatch(setAddressInfo(addressInfo));
      await dispatch(refreshMenuPageForNewStore(store));
    } catch (e) {
      const errorCode = _get(e, 'message.code', null);

      if (errorCode) {
        await dispatch(showErrorToast(errorCode));
      }

      // In case users fail to select a location for some unknown reasons, we should still catch such an error message by directly retrieving the message from the error object.
      const errorMessage = _get(e, 'message.reason', '') || e.message;
      logger.error(`Failed to select location: ${errorMessage}`);
    }
  }
);

/*
 * load address list
 */
export const loadAddressListData = createAsyncThunk(
  'ordering/menu/address/loadAddressDropdownData',
  async (enableToLoadAddressList, { dispatch }) => {
    if (enableToLoadAddressList) {
      await dispatch(loadAddressList());
    }
  }
);

/*
 * load location history list
 */
export const loadLocationHistoryListData = createAsyncThunk(
  'ordering/menu/address/loadLocationHistoryListData',
  async (enableToLoadAddressList, { dispatch }) => {
    if (!enableToLoadAddressList) {
      await dispatch(loadLocationHistoryList());
    }
  }
);

/**
 *  load search location list
 */
export const loadSearchLocationListData = createAsyncThunk(
  'ordering/menu/address/loadSearchLocationListData',
  async (searchKey, { getState }) => {
    if (_isEmpty(searchKey)) {
      return [];
    }

    const state = getState();
    const storeInfo = getStoreInfoData(state);
    const getSearchList = async (search, searchStoreInfo) => {
      try {
        const result = await loadSearchLocationList(search, searchStoreInfo);

        return result;
      } catch (e) {
        logger.error('failed to load search location list data', e);

        return [];
      }
    };

    return new Promise(resolve => {
      _debounce(resolve(getSearchList(searchKey, storeInfo)), 700);
    });
  }
);

/**
 *
 * */
export const loadPlaceInfoData = async searchResult => {
  const result = await loadPlaceInfoById(searchResult, { fromAutocomplete: true });

  return result;
};

/**
 *  update search location list
 */
export const updateSearchLocationListData = createAsyncThunk(
  'ordering/menu/address/updateSearchLocationListData',
  async (formatPositionInfo, { dispatch }) => {
    const result = await dispatch(updateLocationToHistoryList(formatPositionInfo)).then(unwrapResult);

    return result;
  }
);
