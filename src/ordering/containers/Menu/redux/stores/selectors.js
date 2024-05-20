import { createSelector } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import {
  getShippingType,
  getBusinessUTCOffset,
  getDeliveryRadius,
  getStoreId,
  getStoresList as getCoreStoreList,
} from '../../../../redux/modules/app';
import { getAddressCoords } from '../../../../../redux/modules/address/selectors';
import { checkStoreIsOpened } from '../../../../../utils/store-utils';
import { getOpeningHours } from '../../../../../common/utils';
import { computeStraightDistance } from '../../../../../utils/geoUtils';
import Utils from '../../../../../utils/utils';
import { API_REQUEST_STATUS, ADDRESS_RANGE, SHIPPING_TYPES } from '../../../../../common/utils/constants';
import { getCurrentDate } from '../common/selectors';

export const getStoreListInfo = state => state.menu.stores.storeListInfo;

export const getHasStoreListInitialized = createSelector(getStoreListInfo, storeListInfo =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(storeListInfo.status)
);

export const getStoreList = createSelector(
  getStoreId,
  getCurrentDate,
  getShippingType,
  getCoreStoreList,
  getAddressCoords,
  getDeliveryRadius,
  getBusinessUTCOffset,
  (selectedStoreId, currentDate, shippingType, storeList, addressCoords, deliveryRadius, businessUTCOffset) => {
    /**
     * Returns the distance in km between the selected location and the store's location.
     * @param {*} store
     */
    const getStoreDeliveryDistance = store => {
      if (shippingType !== SHIPPING_TYPES.DELIVERY || _isEmpty(addressCoords)) {
        return NaN;
      }

      const { location } = store;

      const distance = computeStraightDistance(addressCoords, {
        lat: location.latitude,
        lng: location.longitude,
      });

      return (distance / 1000).toFixed(2);
    };

    const getStoreOutOfRangeStatus = distance => {
      if (shippingType !== SHIPPING_TYPES.DELIVERY || _isEmpty(addressCoords)) {
        return false;
      }

      if (!distance || !deliveryRadius) {
        return false;
      }

      return distance > deliveryRadius;
    };

    const getStoreReadableOpeningHours = store => {
      const { qrOrderingSettings } = store;

      if (!qrOrderingSettings) {
        return null;
      }

      const { validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo } = qrOrderingSettings;
      const openingHours = getOpeningHours({
        validTimeFrom,
        validTimeTo,
        breakTimeFrom,
        breakTimeTo,
      });

      return openingHours.join(', ');
    };

    return storeList
      .filter(store => {
        const fulfillmentOptions = _get(store, 'fulfillmentOptions', []);
        return fulfillmentOptions.some(option => option.toLowerCase() === shippingType);
      })
      .map(store => {
        const { id, name: title } = store;
        const selected = selectedStoreId === id;
        const distance = getStoreDeliveryDistance(store);
        const location = Utils.getValidAddress(store, ADDRESS_RANGE.COUNTRY);
        const displayOpeningTime = getStoreReadableOpeningHours(store);
        const closed = !checkStoreIsOpened(store, currentDate, businessUTCOffset);
        const outOfRange = getStoreOutOfRangeStatus(distance);
        const available = !(closed || outOfRange);

        return {
          id,
          title,
          closed,
          location,
          distance,
          selected,
          available,
          outOfRange,
          displayOpeningTime,
          displayDistance: shippingType === SHIPPING_TYPES.DELIVERY && !_isEmpty(distance),
        };
      })
      .sort((storeA, storeB) => storeA.distance - storeB.distance);
  }
);

export const getTotalOutlet = createSelector(getStoreList, storeList => storeList.length);
