import { LOCATION_AND_DATE } from '../types';
import _get from 'lodash/get';
import Constants from '../../../utils/constants';
import * as storeUtils from '../../../utils/store-utils';
import * as apiRequest from '../../../utils/request';
import * as timeLib from '../../../utils/time-lib';
import URL from '../../../utils/url';
import { getStoreById, getStores } from '../../../redux/modules/entities/stores';
import { actions as appActions, getBusinessUTCOffset } from './app';
import { actions as homeActions } from './home';

import { createSelector } from 'reselect';
import dayjs from 'dayjs';

const { API_URLS } = URL;
const { DELIVERY_METHOD } = Constants;

const initialState = {
  currentDate: null, // js Date Object
  deliveryType: null,
  storeId: null,
  deliveryAddress: '',
  deliveryCoords: null,
  selectedDay: null, // js Date Object
  selectedFromTime: null, // from time, like 09:00
  timeSlotSoldData: [],
};

export const actions = {
  initial: ({
    currentDate,
    deliveryType,
    storeId,
    deliveryAddress,
    deliveryCoords,
    expectedDay,
    expectedFromTime,
  }) => async (dispatch, getState) => {
    const payload = {
      currentDate,
      deliveryType,
      storeId,
      deliveryAddress,
      deliveryCoords,
      selectedDay: null,
      selectedFromTime: null,
      timeSlotSoldData: [],
    };

    await dispatch(homeActions.loadCoreStores());

    const stores = getStores(getState());
    const businessUTCOffset = getBusinessUTCOffset(getState());

    if (payload.storeId) {
      const store = getStoreById(getState(), payload.storeId);
      const fulfillmentOptions = _get(store, 'fulfillmentOptions', []);

      const isOpen = storeUtils.checkStoreIsOpened(store, payload.currentDate, businessUTCOffset);

      const isFulfillment = fulfillmentOptions.some(option => option.toLowerCase() === deliveryType);

      payload.storeId = isFulfillment && isOpen ? payload.storeId : null;
    }

    if (!payload.storeId && deliveryCoords && deliveryType === DELIVERY_METHOD.DELIVERY) {
      const { store } = storeUtils.findNearlyAvailableStore(stores, {
        coords: deliveryCoords,
        currentDate: payload.currentDate,
        utcOffset: businessUTCOffset,
      });

      payload.storeId = _get(store, 'id', null);
    }

    if (!payload.storeId) {
      return dispatch({
        type: LOCATION_AND_DATE.INITIAL,
        payload,
      });
    }

    await dispatch(appActions.loadCoreBusiness(payload.storeId));
    const store = getStoreById(getState(), payload.storeId);

    if (store) {
      const enablePerTimeSlotLimitForPreOrder = storeUtils.isEnablePerTimeSlotLimitForPreOrder(store);

      const orderDateList = storeUtils.getOrderDateList(store, deliveryType, currentDate, businessUTCOffset);
      const expectedOrderDate =
        expectedDay && orderDateList.find(orderDate => dayjs(orderDate.date).isSame(expectedDay));

      // initial selectedDay
      if (expectedOrderDate && expectedOrderDate.isOpen) {
        payload.selectedDay = expectedOrderDate.date;
      } else {
        const firstOpenOrderDate = orderDateList.find(orderDate => orderDate.isOpen);
        payload.selectedDay = firstOpenOrderDate ? firstOpenOrderDate.date : null;
      }

      if (enablePerTimeSlotLimitForPreOrder && payload.selectedDay) {
        payload.timeSlotSoldData = await fetchTimeSlotSoldData({
          deliveryType,
          selectedDay: payload.selectedDay,
          storeId: store.id,
        });
      }

      // initial selectedFromTime
      if (payload.selectedDay) {
        const selectedOrderDate = orderDateList.find(orderDate => dayjs(orderDate.date).isSame(payload.selectedDay));
        const availableTimeSlotList = storeUtils.getAvailableTimeSlotList(store, {
          currentDate,
          businessUTCOffset,
          selectedOrderDate,
          deliveryType,
          timeSlotSoldData: payload.timeSlotSoldData,
        });

        const expectedTime =
          expectedFromTime && availableTimeSlotList.find(time => timeLib.isSame(time, expectedFromTime));

        if (expectedTime && !expectedTime.soldOut) {
          payload.selectedFromTime = expectedTime.from;
        } else {
          const firstAvailableTime = availableTimeSlotList.find(time => !time.soldOut);
          payload.selectedFromTime = firstAvailableTime ? firstAvailableTime.from : null;
        }
      }
    }

    dispatch({
      type: LOCATION_AND_DATE.INITIAL,
      payload,
    });
  },

  deliveryTypeChanged: deliveryType => async (dispatch, getState) => {
    const state = getState();
    let store = getStore(state);

    const payload = {
      deliveryType,
      selectedDay: null,
      selectedFromTime: null,
      timeSlotSoldData: [],
      storeId: _get(store, 'id', null),
    };

    if (!store) {
      return dispatch({
        type: LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED,
        payload,
      });
    }

    const storeFulfillmentOptions = _get(store, 'fulfillmentOptions', []).map(item => item.toLowerCase());

    // if store not support the delivery type
    if (!storeFulfillmentOptions.includes(deliveryType)) {
      const currentDate = getCurrentDate(state);
      const stores = getStores(state);
      const businessUTCOffset = getBusinessUTCOffset(state);
      const deliveryCoords = getDeliveryCoords(state);

      // re-find the nearestStore
      if (deliveryType === DELIVERY_METHOD.DELIVERY && deliveryCoords) {
        const { store: nearestStore } = storeUtils.findNearlyAvailableStore(stores, {
          coords: deliveryCoords,
          currentDate: currentDate,
          utcOffset: businessUTCOffset,
        });

        payload.storeId = _get(nearestStore, 'id', null);
      } else {
        payload.storeId = null;
      }
    }

    const preSelectedDay = getSelectedDay(state);

    if (!preSelectedDay || !payload.storeId) {
      return dispatch({
        type: LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED,
        payload,
      });
    }

    store = getStoreById(getState(), payload.storeId);

    const currentDate = getCurrentDate(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const orderDateList = storeUtils.getOrderDateList(store, deliveryType, currentDate, businessUTCOffset);
    const preSelectedOrderDate = orderDateList.find(orderDate => dayjs(orderDate.date).isSame(preSelectedDay));
    const enablePerTimeSlotLimitForPreOrder = storeUtils.isEnablePerTimeSlotLimitForPreOrder(store);

    if (preSelectedOrderDate && preSelectedOrderDate.isOpen) {
      payload.selectedDay = preSelectedOrderDate.date;
    } else {
      const firstAvailableOrderDate = orderDateList.find(orderDate => orderDate.isOpen);
      payload.selectedDay = firstAvailableOrderDate ? firstAvailableOrderDate.date : null;
    }

    if (!payload.selectedDay) {
      return dispatch({
        type: LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED,
        payload,
      });
    }

    if (enablePerTimeSlotLimitForPreOrder) {
      payload.timeSlotSoldData = await fetchTimeSlotSoldData({
        deliveryType,
        selectedDay: payload.selectedDay,
        storeId: store.id,
      });
    }

    const selectedOrderDate = orderDateList.find(orderDate => dayjs(orderDate.date).isSame(payload.selectedDay));

    const availableTimeSlotList = storeUtils.getAvailableTimeSlotList(store, {
      currentDate,
      businessUTCOffset,
      selectedOrderDate,
      deliveryType,
      timeSlotSoldData: payload.timeSlotSoldData,
    });

    const firstAvailableTimeSlot = availableTimeSlotList.find(timeSlot => !timeSlot.soldOut);
    payload.selectedFromTime = firstAvailableTimeSlot ? firstAvailableTimeSlot.from : null;

    dispatch({
      type: LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED,
      payload,
    });
  },

  storeChanged: storeId => ({
    type: LOCATION_AND_DATE.STORE_CHANGED,
    payload: storeId,
  }),

  deliveryAddressChanged: deliveryAddress => ({
    type: LOCATION_AND_DATE.DELIVERY_ADDRESS_CHANGED,
    payload: deliveryAddress,
  }),

  selectedDayChanged: selectedDay => async (dispatch, getState) => {
    const payload = {
      selectedDay,
      timeSlotSoldData: [],
      selectedFromTime: null,
    };
    const state = getState();
    const store = getStore(state);

    if (!selectedDay || !store) {
      return dispatch({
        type: LOCATION_AND_DATE.SELECTED_DAY_CHANGE,
        payload,
      });
    }

    const enablePerTimeSlotLimitForPreOrder = storeUtils.isEnablePerTimeSlotLimitForPreOrder(store);
    const deliveryType = getDeliveryType(state);
    const currentDate = getCurrentDate(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const orderDateList = storeUtils.getOrderDateList(store, deliveryType, currentDate, businessUTCOffset);
    const selectedOrderDate = orderDateList.find(orderDate => dayjs(selectedDay).isSame(orderDate.date));

    if (enablePerTimeSlotLimitForPreOrder) {
      payload.timeSlotSoldData = await fetchTimeSlotSoldData({
        deliveryType,
        selectedDay,
        storeId: store.id,
      });
    }

    const timeSlotList = storeUtils.getAvailableTimeSlotList(store, {
      currentDate,
      businessUTCOffset,
      selectedOrderDate,
      deliveryType,
      timeSlotSoldData: payload.timeSlotSoldData,
    });
    const firstAvailableTime = timeSlotList.find(timeSlot => !timeSlot.soldOut);
    payload.selectedFromTime = firstAvailableTime ? firstAvailableTime.from : null;

    dispatch({
      type: LOCATION_AND_DATE.SELECTED_DAY_CHANGE,
      payload,
    });
  },

  selectedFromTimeChanged: selectedFromTime => ({
    type: LOCATION_AND_DATE.SELECTED_FROM_TIME_CHANGED,
    payload: selectedFromTime,
  }),

  currentDateChange: currentDate => ({
    type: LOCATION_AND_DATE.CURRENT_DATE_UPDATED,
    payload: currentDate,
  }),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCATION_AND_DATE.INITIAL:
      const { currentDate, deliveryType, storeId, deliveryAddress, deliveryCoords } = action.payload;

      return {
        ...state,
        currentDate,
        deliveryType,
        storeId,
        deliveryAddress,
        deliveryCoords,
        selectedDay: action.payload.selectedDay,
        selectedFromTime: action.payload.selectedFromTime,
        timeSlotSoldData: action.payload.timeSlotSoldData,
      };
    case LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED:
      return {
        ...state,
        deliveryType: action.payload.deliveryType,
        selectedDay: action.payload.selectedDay,
        selectedFromTime: action.payload.selectedFromTime,
        timeSlotSoldData: action.payload.timeSlotSoldData,
        storeId: action.payload.storeId,
      };
    case LOCATION_AND_DATE.STORE_CHANGED:
      return {
        ...state,
        storeId: action.payload,
      };
    case LOCATION_AND_DATE.DELIVERY_ADDRESS_CHANGED:
      return {
        ...state,
        deliveryAddress: action.payload,
      };
    case LOCATION_AND_DATE.SELECTED_DAY_CHANGE:
      const { selectedDay, timeSlotSoldData, selectedFromTime } = action.payload;

      return {
        ...state,
        selectedDay,
        timeSlotSoldData,
        selectedFromTime,
      };
    case LOCATION_AND_DATE.SELECTED_FROM_TIME_CHANGED:
      return {
        ...state,
        selectedFromTime: action.payload,
      };
    case LOCATION_AND_DATE.CURRENT_DATE_UPDATED:
      return {
        ...state,
        currentDate: action.payload,
      };
    case LOCATION_AND_DATE.TIME_SLOT_SOLD_DATA_LOADED:
      return {
        ...state,
        timeSlotSoldData: action.payload.map(({ timeSlotStartDate, count }) => {
          return {
            date: timeSlotStartDate,
            count,
          };
        }),
      };
    default:
      return state;
  }
};

const fetchTimeSlotSoldData = async ({ deliveryType, selectedDay, storeId }) => {
  try {
    const { method, url } = API_URLS.GET_TIME_SLOT(deliveryType, selectedDay.toISOString(), storeId);
    const timeSlotSoldData = await apiRequest[method](url);
    return timeSlotSoldData;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getDeliveryType = state => {
  return _get(state.locationAndDate, 'deliveryType', null);
};

export const getStoreId = state => {
  return _get(state.locationAndDate, 'storeId', null);
};

export const getStore = state => {
  const storeId = getStoreId(state);
  return getStoreById(state, storeId);
};

export const getDeliveryAddress = state => {
  return _get(state.locationAndDate, 'deliveryAddress', '');
};

export const getDeliveryCoords = state => _get(state.locationAndDate, 'deliveryCoords', null);

export const getSelectedDay = state => _get(state.locationAndDate, 'selectedDay', null);

export const getSelectedFromTime = state => _get(state.locationAndDate, 'selectedFromTime', null);

export const getCurrentDate = state => {
  return _get(state.locationAndDate, 'currentDate', new Date());
};

export const getTimeSlotSoldData = state => _get(state.locationAndDate, 'timeSlotSoldData', []);

export const getOrderDateList = createSelector(
  getStore,
  getDeliveryType,
  getCurrentDate,
  getBusinessUTCOffset,
  (store, deliveryType, currentDate, businessUTCOffset) => {
    if (!store) {
      return [];
    }

    return storeUtils.getOrderDateList(store, deliveryType, currentDate, businessUTCOffset);
  }
);

export const getSelectedOrderDate = createSelector(getSelectedDay, getOrderDateList, (selectedDay, orderDateList) => {
  if (!selectedDay) {
    return null;
  }

  return orderDateList.find(orderDate => {
    return dayjs(selectedDay).isSame(orderDate.date);
  });
});

export const getAvailableTimeSlotList = createSelector(
  [getStore, getCurrentDate, getBusinessUTCOffset, getSelectedOrderDate, getDeliveryType, getTimeSlotSoldData],
  (store, currentDate, businessUTCOffset, selectedOrderDate, deliveryType, timeSlotSoldData) => {
    return storeUtils.getAvailableTimeSlotList(store, {
      currentDate,
      businessUTCOffset,
      selectedOrderDate,
      deliveryType,
      timeSlotSoldData,
    });
  }
);

export const getSelectedTime = createSelector(
  getSelectedFromTime,
  getAvailableTimeSlotList,
  (selectedFromTime, availableTimeSlotList) => {
    if (!selectedFromTime) {
      return null;
    }

    return availableTimeSlotList.find(timeSlot => {
      return timeLib.isSame(timeSlot.from, selectedFromTime);
    });
  }
);

export default reducer;
