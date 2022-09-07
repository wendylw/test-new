import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isNumber from 'lodash/isNumber';
import _isEqual from 'lodash/isEqual';
import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import i18next from 'i18next';
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
import { changeStore, hideLocationDrawer } from '../common/thunks';
import { getIsAddressOutOfRange, getCurrentDate } from '../common/selectors';
import { getStoreInfoData, getErrorOptions } from './selectors';
import { findNearestAvailableStore } from '../../../../../utils/store-utils';
import { toast } from '../../../../../common/utils/feedback';
import logger from '../../../../../utils/monitoring/logger';

export const checkDeliveryRange = createAsyncThunk(
  'ordering/menu/address/checkDeliveryRange',
  async (_, { getState }) => {
    const state = getState();
    const isAddressOutOfRange = getIsAddressOutOfRange(state);
    const errorOptions = getErrorOptions(state);

    if (!isAddressOutOfRange) return;

    toast(i18next.t(`OrderingDelivery:OutOfDeliveryRange`, errorOptions), {
      type: 'error',
    });

    logger.log('Ordering_Menu_CheckIfDeliveryAddressOutOfRange');
  }
);

/**
 * Location drawer shown
 */
export const locationDrawerShown = createAsyncThunk(
  'ordering/menu/address/locationDrawerShown',
  async (isLoadableAddressList, { dispatch, getState }) => {
    const state = getState();
    const storeId = getStoreId(state);
    const business = getBusiness(state);

    if (isLoadableAddressList) {
      await dispatch(loadAddressList());
    } else {
      await dispatch(loadLocationHistoryList());
    }

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
        throw new Error('store coordinates is incorrect.');
      }

      return {
        coords,
        country,
        radius: deliveryRadius * 1000,
      };
    } catch (e) {
      logger.error('Ordering_Menu_LoadStoreInfoFailed', { message: e?.message });
      throw e;
    }
  }
);

export const locationDrawerHidden = createAsyncThunk('ordering/menu/address/locationDrawerHidden', async () => {});

const getFormatSelectAddressInfo = (addressOrLocationInfo, type) => {
  const addressInfo = {};

  if (type === 'address') {
    const {
      id,
      deliveryTo: fullName,
      addressName: shortName,
      location: { longitude: lng, latitude: lat },
      countryCode,
      postCode,
      city,
    } = addressOrLocationInfo;

    addressInfo.savedAddressId = id;
    addressInfo.fullName = fullName;
    addressInfo.shortName = shortName;
    addressInfo.coords = { lng, lat };
    addressInfo.countryCode = countryCode;
    addressInfo.postCode = postCode;
    addressInfo.city = city;
  } else if (type === 'location') {
    const {
      placeId,
      address: fullName,
      coords,
      displayComponents: { mainText: shortName },
      addressComponents: { countryCode, postCode, city },
    } = addressOrLocationInfo;

    addressInfo.placeId = placeId;
    addressInfo.fullName = fullName;
    addressInfo.shortName = shortName;
    addressInfo.coords = coords;
    addressInfo.countryCode = countryCode;
    addressInfo.postCode = postCode;
    addressInfo.city = city;
  }

  return addressInfo;
};
/**
 * select location from the location drawer
 */
export const locationSelected = createAsyncThunk(
  'ordering/menu/address/locationSelected',
  async ({ addressOrLocationInfo, type }, { dispatch, getState }) => {
    const addressInfo = getFormatSelectAddressInfo(addressOrLocationInfo, type);
    const state = getState();
    const prevAddressInfo = getAddressInfo(state);
    const errorOptions = getErrorOptions(state);

    if (_isEqual(prevAddressInfo, addressInfo)) {
      await dispatch(hideLocationDrawer());
      return;
    }

    /**
     * After the user selects the new valid location, there are 4 things that need to be done:
     * 1. Find the nearest available store
     * 2. Sync up current address info with the BFF
     * 3. Update the delivery details in the Redux store
     * 4. Change the store id
     */
    try {
      const coords = _get(addressInfo, 'coords', null);

      if (_isEmpty(coords)) {
        toast(i18next.t(`OrderingDelivery:AddressNotFound`), {
          type: 'error',
        });

        throw new Error('address coordination is not found');
      }

      let stores = getCoreStoreList(state);
      const utcOffset = getBusinessUTCOffset(state);
      const currentDate = getCurrentDate(state);
      const currentStoreId = getStoreId(state);
      const deliveryRadius = getDeliveryRadius(state);

      if (_isEmpty(stores)) {
        // We only fetch the core store API again when the previous call hasn't been completed or sent yet for better performance
        await dispatch(appActionCreators.loadCoreStores());
        stores = getCoreStoreList(getState());
      }

      const { store, distance } = findNearestAvailableStore(stores, {
        coords,
        currentDate,
        utcOffset,
      });

      const deliveryDistance = (distance / 1000).toFixed(2);

      if (_isEmpty(store) || deliveryDistance > deliveryRadius) {
        toast(i18next.t(`OrderingDelivery:OutOfDeliveryRange`, errorOptions));

        throw new Error('no available store according to the current time or delivery range');
      }

      const storeId = _get(store, 'id', null);

      await dispatch(setAddressInfo(addressInfo));

      await dispatch(appActionCreators.loadDeliveryAddressDetailsIfNeeded());

      if (_isEqual(currentStoreId, storeId)) {
        await dispatch(hideLocationDrawer());
        return;
      }

      await dispatch(changeStore(storeId)).unwrap();
      await dispatch(hideLocationDrawer());
    } catch (e) {
      logger.error('Ordering_Menu_SelectLocationFailed', { message: e?.message });
      throw e;
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

    try {
      const state = getState();
      const storeInfo = getStoreInfoData(state);
      const result = await loadSearchLocationList(searchKey, storeInfo);

      return result;
    } catch (e) {
      logger.error('Ordering_Menu_LoadSearchLocationListFailed', e);

      return [];
    }
  }
);

/**
 *
 * */
export const loadPlaceInfo = async searchResult => {
  const result = await loadPlaceInfoById(searchResult, { fromAutocomplete: true });

  return result;
};

/**
 *  update search location list
 */
export const updateSearchLocationList = createAsyncThunk(
  'ordering/menu/address/updateSearchLocationList',
  async (formatPositionInfo, { dispatch }) => {
    const result = await dispatch(updateLocationToHistoryList(formatPositionInfo)).then(unwrapResult);

    return result;
  }
);
