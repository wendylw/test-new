import { LOCATION_AND_DATE } from '../types';
import _get from 'lodash/get';
import Constants from '../../../utils/constants';
import * as storeUtils from '../../../utils/store-utils';
import * as apiRequest from '../../../utils/request';
import * as timeLib from '../../../utils/time-lib';
import URL from '../../../utils/url';
import { getStoreById, getStores } from '../../../redux/modules/entities/stores';
import { actions as appActions, getBusinessUTCOffset, getBusinessInfo } from './app';
import { actions as homeActions } from './home';

import { createSelector } from 'reselect';
import dayjs from 'dayjs';

const { API_URLS } = URL;
const { DELIVERY_METHOD, TIME_SLOT_NOW } = Constants;

const initialState = {
  currentDate: null, // js Date Object
  deliveryType: null,
  storeId: null,
  deliveryAddress: '',
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
    expectedTimeFrom,
  }) => async (dispatch, getState) => {
    const payload = {
      currentDate,
      deliveryType,
      storeId,
      deliveryAddress,
      selectedDay: expectedDay,
      selectedFromTime: expectedTimeFrom,
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

    if (payload.storeId) {
      await dispatch(appActions.loadCoreBusiness(payload.storeId));
    }

    dispatch({
      type: LOCATION_AND_DATE.INITIAL,
      payload,
    });
  },

  deliveryTypeChanged: deliveryType => ({
    type: LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED,
    payload: deliveryType,
  }),

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

    if (!selectedDay) {
      return dispatch({
        type: LOCATION_AND_DATE.SELECTED_DAY_CHANGE,
        payload,
      });
    }

    const state = getState();
    const enablePerTimeSlotLimitForPreOrder = isStoreEnablePerTimeSlotLimitForPreOrder(state);
    const deliveryType = getDeliveryType(state);
    const storeId = getStoreId(state);

    if (enablePerTimeSlotLimitForPreOrder) {
      payload.timeSlotSoldData = await fetchTimeSlotSoldData({
        deliveryType,
        selectedDay,
        storeId,
      });
    }

    const firstAvailableTime = getFirstAvailableTime(getState());
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
      const { currentDate, deliveryType, storeId, deliveryAddress } = action.payload;

      return {
        ...state,
        currentDate,
        deliveryType,
        storeId,
        deliveryAddress,
        selectedDay: null,
        selectedFromTime: null,
        timeSlotSoldData: [],
      };
    case LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED:
      return {
        ...state,
        deliveryType: action.payload,
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
  const businessInfo = getBusinessInfo(state);
  const store = getStoreById(state, storeId);
  if (!store) {
    return null;
  }

  // some store data only get from businessInfo
  const businessStores = _get(businessInfo, 'stores', []);
  const businessStore = businessStores.find(businessStore => businessStore.id === storeId);

  if (!businessStore) {
    Object.assign(store.qrOrderingSettings, {
      enablePerTimeSlotLimitForPreOrder: false,
      maxPreOrdersPerTimeSlot: 0,
    });

    return store;
  }

  Object.assign(store.qrOrderingSettings, {
    enablePerTimeSlotLimitForPreOrder: businessStore.qrOrderingSettings.enablePerTimeSlotLimitForPreOrder,
    maxPreOrdersPerTimeSlot: businessStore.qrOrderingSettings.maxPreOrdersPerTimeSlot,
  });
  return store;
};

export const getDeliveryAddress = state => {
  return _get(state.locationAndDate, 'deliveryAddress', '');
};

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
    if (!store || !selectedOrderDate || !selectedOrderDate.isOpen) {
      return [];
    }
    let timeList = [];
    if (selectedOrderDate.isToday) {
      timeList = storeUtils.getTodayTimeList(store, { currentDate, deliveryType, utcOffset: businessUTCOffset });
    } else {
      timeList = storeUtils.getPreOrderTimeList(store, deliveryType);
    }

    const isDelivery = deliveryType === DELIVERY_METHOD.DELIVERY;
    const date = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(selectedOrderDate.date));

    return timeList.map(time => {
      if (time === TIME_SLOT_NOW) {
        return {
          soldOut: false,
          from: TIME_SLOT_NOW,
          to: TIME_SLOT_NOW,
        };
      }

      const dateTime = timeLib.setDateTime(time, date);

      const soldOut = storeUtils.isDateTimeSoldOut(store, timeSlotSoldData, dateTime.toDate(), businessUTCOffset);

      return {
        soldOut,
        from: time,
        to: isDelivery ? timeLib.add(time, { value: 1, unit: 'hour' }) : time,
      };
    });
  }
);

export const getFirstAvailableDate = createSelector(getOrderDateList, dateList => dateList.find(date => date.isOpen));

export const getFirstAvailableTime = createSelector(getAvailableTimeSlotList, timeSlotList =>
  timeSlotList.find(timeSlot => !timeSlot.soldOut)
);

export const getSelectedTime = createSelector(
  getSelectedFromTime,
  getAvailableTimeSlotList,
  (selectedFromTime, availableTimeSlotList) => {
    if (!selectedFromTime) {
      return null;
    }

    return availableTimeSlotList.find(timeSlot => {
      if (timeSlot.from === TIME_SLOT_NOW || selectedFromTime === TIME_SLOT_NOW) {
        return timeSlot.from === selectedFromTime;
      }

      return timeLib.isSame(timeSlot.from, selectedFromTime);
    });
  }
);

export const isStoreEnablePerTimeSlotLimitForPreOrder = createSelector(getStore, store =>
  _get(store, 'qrOrderingSettings.enablePerTimeSlotLimitForPreOrder', false)
);

export default reducer;
