import i18next from 'i18next';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isNumber from 'lodash/isNumber';
import _isEqual from 'lodash/isEqual';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAddressInfo } from '../../../../../redux/modules/address/selectors';
import { setAddressInfo } from '../../../../../redux/modules/address/thunks';
import { getBusinessByName } from '../../../../../redux/modules/entities/businesses';
import { getCoreStoreList, getStoreById } from '../../../../../redux/modules/entities/stores';
import {
  getStoreId,
  getBusiness,
  getShippingType,
  getDeliveryRadius,
  getMerchantCountry,
  getBusinessUTCOffset,
  actions as appActionCreators,
} from '../../../../redux/modules/app';
import { refreshMenuPage, hideLocationDrawer } from '../common/thunks';
import { getCurrentDate, getNearestStore, getIsAddressOutOfRange } from '../common/selectors';
import {
  actions as locationAndDateActionCreators,
  getSelectedDay,
  getSelectedFromTime,
} from '../../../../redux/modules/locationAndDate';
import { isEnablePerTimeSlotLimitForPreOrder, getStoreAvailableDateAndTime } from '../../../../../utils/store-utils';
import Utils from '../../../../../utils/utils';

export const showErrorToast = createAsyncThunk('ordering/menu/address/showErrorToast', async message => ({ message }));

export const clearErrorToast = createAsyncThunk('ordering/menu/address/clearErrorToast', async () => {});

export const checkDeliveryRange = createAsyncThunk(
  'ordering/menu/address/checkDeliveryRange',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const isAddressOutOfRange = getIsAddressOutOfRange(state);

    if (!isAddressOutOfRange) return;

    const deliveryRadius = getDeliveryRadius(state);
    const errorMessage = i18next.t('OutOfDeliveryRange', { distance: deliveryRadius });

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
        throw new Error('Delivery radius is incorrect.');
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
        throw new Error('Store is not found.');
      }

      const coords = {
        lat: _get(store, 'location.latitude', null),
        lng: _get(store, 'location.longitude', null),
      };

      if (!_isNumber(coords.lat) || !_isNumber(coords.lng)) {
        throw new Error('Store coordination is incorrect.');
      }

      return {
        coords,
        country,
        radius: deliveryRadius * 1000,
      };
    } catch (e) {
      console.error('fail to load storeInfo', e);
      return {};
    }
  }
);

export const locationDrawerHidden = createAsyncThunk('ordering/menu/address/locationDrawerHidden', async () => {});

// TODO: What the hell for this one? Need to take more time to understand buckets of legacy logic.
export const updateTimeSlot = createAsyncThunk(
  'ordering/menu/address/updateTimeSlot',
  async (store, { dispatch, getState }) => {
    const state = getState();
    const deliveryType = getShippingType(state);
    const currentDate = getCurrentDate(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const enablePerTimeSlotLimitForPreOrder = isEnablePerTimeSlotLimitForPreOrder(store);
    const expectedDeliveryDate = Utils.getExpectedDeliveryDateFromSession();
    const expectedDay = getSelectedDay(state) || _get(expectedDeliveryDate, 'date.date', null);
    const expectedFromTime = getSelectedFromTime(state) || _get(expectedDeliveryDate, 'hour.from', null);
    const storeId = _get(store, 'id', null);

    const { orderDate, fromTime } = getStoreAvailableDateAndTime(store, {
      expectedDay,
      expectedFromTime,
      deliveryType,
      currentDate,
      businessUTCOffset,
    });

    const selectedDay = _get(orderDate, 'date', null);
    const selectedFromTime = fromTime;

    if (enablePerTimeSlotLimitForPreOrder && selectedDay) {
      dispatch(
        locationAndDateActionCreators.loadTimeSlotSoldData({
          deliveryType,
          selectedDay,
          storeId,
        })
      );
    }
  }
);

/**
 * select location from the location drawer
 */
export const selectLocation = createAsyncThunk(
  'ordering/menu/address/selectLocation',
  async (addressInfo, { dispatch, getState }) => {
    const state = getState();
    const prevAddressInfo = getAddressInfo(state);

    if (_isEqual(prevAddressInfo, addressInfo)) {
      await dispatch(hideLocationDrawer());
      return;
    }

    const business = getBusiness(state);
    const address = {
      location: {
        longitude: _get(addressInfo, 'coords.lng', 0),
        latitude: _get(addressInfo, 'coords.lat', 0),
      },
    };

    try {
      if (_isEmpty(addressInfo.coords)) {
        // TODO: Ask PO to provide reasonable typewriting for this case.
        throw new Error('Address coordination is incorrect. Please try another one.');
      }

      /**
       * If the selected location is out of the delivery ranges of all stores, pop up an error toast to hint users.
       * Leave a comment for newcomers:
       * we need to fetch core store API every time to get the latest store list since this is the only way to make sure the selected location is within the delivery range.
       */
      await dispatch(appActionCreators.loadCoreStores(address));

      const stores = getCoreStoreList(getState());

      if (_isEmpty(stores)) {
        const { qrOrderingSettings } = getBusinessByName(state, business);
        const { deliveryRadius } = qrOrderingSettings || {};
        const errorMessage = i18next.t('OutOfDeliveryRange', { distance: deliveryRadius.toFixed(1) });
        throw new Error(errorMessage);
      }

      /**
       * After the user selects the new valid location, there are 3 things that need to be done:
       * 1. Sync up current address info with the BFF
       * 2. Find the nearest available store
       * 3. Update the store id by hard-refreshing menu page
       */
      await dispatch(setAddressInfo(addressInfo));

      // TODO: Remind Wendy to disable the click button for pickup type.
      const store = getNearestStore(getState());
      const storeId = _get(store, 'id', null);

      if (_isEmpty(storeId)) {
        // TODO: Ask PO to provide reasonable typewriting for this case.
        throw new Error('No store is available for your location. Please try another one.');
      }

      await dispatch(appActionCreators.loadCoreBusiness(storeId));
      const storeInfo = getStoreById(getState(), storeId);

      if (_isEmpty(storeInfo)) {
        // TODO: Ask PO to provide reasonable typewriting for this case.
        throw new Error('No delivery time is available for your location. Please try another one.');
      }

      const storeHashCode = _get(store, 'hash', null);

      // TODO: huaicheng will check with PO whether this action is necessary.
      await dispatch(updateTimeSlot(storeInfo));
      await dispatch(refreshMenuPage(storeHashCode));
    } catch (e) {
      await dispatch(showErrorToast(e.message));
    }
  }
);
