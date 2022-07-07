import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAddressCoords } from '../../../../../redux/modules/address/selectors';
import { getCoreStoreList, getStoreById } from '../../../../../redux/modules/entities/stores';
import {
  getStoresList,
  getCurrentDate,
  getShippingType,
  getBusinessUTCOffset,
  actions as appActionCreators,
} from '../../../../redux/modules/app';
import { refreshMenuPageForNewStore } from '../common/thunks';
import { checkStoreIsOpened, findNearestAvailableStore } from '../../../../../utils/store-utils';
import Constants from '../../../../../utils/constants';

const { DELIVERY_METHOD } = Constants;

/**
 * Store branch drawer shown
 */
export const storeDrawerShown = createAsyncThunk(
  'ordering/menu/stores/storeDrawerShown',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const addressCoords = getAddressCoords(state);
    const deliveryType = getShippingType(state);
    const address = addressCoords && {
      location: {
        longitude: _get(addressCoords, 'lng', 0),
        latitude: _get(addressCoords, 'lat', 0),
      },
    };

    await dispatch(appActionCreators.loadCoreStores(deliveryType === DELIVERY_METHOD.DELIVERY ? address : ''));

    let stores = [];
    const newState = getState();
    const businessUTCOffset = getBusinessUTCOffset(newState);
    const allStore = getStoresList(newState);

    stores = allStore.filter(
      item => item.fulfillmentOptions.map(citem => citem.toLowerCase()).indexOf(deliveryType.toLowerCase()) !== -1
    );

    const currentTime = getCurrentDate(newState);

    stores.forEach(store => {
      store.isClose = !checkStoreIsOpened(store, currentTime, businessUTCOffset);
    });

    return stores;
  }
);

export const storeDrawerHidden = createAsyncThunk('ordering/menu/stores/storeDrawerHidden', async () => {});

/**
 * select store from the store branch drawer
 */
export const selectStoreBranch = createAsyncThunk(
  'ordering/menu/stores/selectStoreBranch',
  async (store, { dispatch, getState }) => {
    if (store.isClose) return; // do nothing

    const state = getState();
    const coords = getAddressCoords(state);
    const currentDate = getCurrentDate(state);
    const deliveryType = getShippingType(state);
    const utcOffset = getBusinessUTCOffset(state);
    const fulfillmentOptions = _get(store, 'fulfillmentOptions', []);
    const isDeliveryType = deliveryType === DELIVERY_METHOD.DELIVERY;
    const isOpen = checkStoreIsOpened(store, currentDate, utcOffset);
    const isFulfillment = fulfillmentOptions.some(option => option.toLowerCase() === deliveryType);
    const isCurrentStoreAvailable = isOpen && isFulfillment;

    let storeId = null;

    if (isCurrentStoreAvailable) {
      storeId = _get(store, 'id', null);
      const storeHashCode = _get(store, 'hash', null);
      await dispatch(refreshMenuPageForNewStore(storeHashCode));
    } else if (coords && isDeliveryType) {
      // TODO: Need to check with PO whether we should keep this logic or not.
      // I remember last time QA complained that it really looks like a bug.
      const addressCoords = getAddressCoords(state);
      const address = addressCoords && {
        location: {
          longitude: _get(addressCoords, 'lng', 0),
          latitude: _get(addressCoords, 'lat', 0),
        },
      };
      await dispatch(appActionCreators.loadCoreStores(address));
      const stores = getCoreStoreList(getState());
      const { store: nearestStore } = findNearestAvailableStore(stores, {
        coords,
        currentDate,
        utcOffset,
      });

      storeId = _get(nearestStore, 'id', null);

      if (storeId) {
        await dispatch(appActionCreators.loadCoreBusiness(storeId));
        const storeInfo = getStoreById(getState(), storeId);

        if (_isEmpty(storeInfo)) {
          // TODO: What will happen if store info is empty?
          return;
        }

        const storeHashCode = _get(nearestStore, 'hash', null);
        await dispatch(refreshMenuPageForNewStore(storeHashCode));
      }
    }
  }
);
