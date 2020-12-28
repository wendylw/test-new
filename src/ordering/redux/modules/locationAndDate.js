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

const { API_URLS } = URL;
const { DELIVERY_METHOD, TIME_SLOT_NOW } = Constants;

const initialState = {
  currentDate: null,
  deliveryType: null,
  storeId: null,
  deliveryAddress: '',
  selectedDate: null,
  selectedTime: null,
  timeSlotSoldData: [],
};

export const actions = {
  initial: ({ deliveryType, storeId, deliveryAddress, deliveryCoords }) => async (dispatch, getState) => {
    const payload = {
      currentDate: new Date(),
      deliveryType,
      storeId,
      deliveryAddress,
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
      const store = storeUtils.findNearlyAvailableStore(stores, {
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

    const store = getStore(getState());

    if (store) {
      const availableFirstDate = getFirstAvailableDate(getState());

      dispatch(actions.selectedDateChanged(availableFirstDate));
    }
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

  selectedDateChanged: selectedDate => async (dispatch, getState) => {
    dispatch({
      type: LOCATION_AND_DATE.DELIVERY_DATE_CHANGED,
      payload: selectedDate,
    });

    await dispatch(actions.loadTimeSlotSoldData());

    const firstAvailableTime = getFirstAvailableTime(getState());
    dispatch(actions.selectedTimeChanged(firstAvailableTime));
  },

  loadTimeSlotSoldData: () => async (dispatch, getState) => {
    try {
      const state = getState();
      const deliveryType = getDeliveryType(state);
      const store = getStore(state);
      const selectedDate = getSelectedDate(state);

      if (!store.enablePerTimeSlotLimitForPreOrder) {
        return;
      }

      const { method, url } = API_URLS.GET_TIME_SLOT(deliveryType, selectedDate.date.toISOString(), store.id);

      const timeSlotSoldData = await apiRequest[method](url);

      dispatch({
        type: LOCATION_AND_DATE.TIME_SLOT_SOLD_DATA_LOADED,
        payload: timeSlotSoldData,
      });
    } catch (e) {
      console.log(e);

      dispatch({
        type: LOCATION_AND_DATE.TIME_SLOT_SOLD_DATA_LOADED,
        payload: [],
      });
    }
  },

  selectedTimeChanged: selectedTime => ({
    type: LOCATION_AND_DATE.DELIVERY_TIME_CHANGED,
    payload: selectedTime,
  }),

  currentDateChange: currentDate => ({
    type: LOCATION_AND_DATE.CURRENT_DATE_UPDATED,
    payload: currentDate,
  }),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCATION_AND_DATE.INITIAL:
      const { currentDate, deliveryType, storeId, deliveryAddress, disableSelectDeliveryType } = action.payload;

      return {
        ...state,
        currentDate,
        deliveryType,
        storeId,
        deliveryAddress,
        disableSelectDeliveryType,
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
    case LOCATION_AND_DATE.DELIVERY_DATE_CHANGED:
      return {
        ...state,
        selectedDate: action.payload,
      };
    case LOCATION_AND_DATE.DELIVERY_TIME_CHANGED:
      return {
        ...state,
        selectedTime: action.payload,
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

export const getSelectedDate = state => {
  return _get(state.locationAndDate, 'selectedDate', null);
};

export const getSelectedTime = state => {
  return _get(state.locationAndDate, 'selectedTime', null);
};

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

export const getAvailableTimeSlotList = createSelector(
  [getStore, getCurrentDate, getBusinessUTCOffset, getSelectedDate, getDeliveryType, getTimeSlotSoldData],
  (store, currentDate, businessUTCOffset, selectedDate, deliveryType, timeSlotSoldData) => {
    if (!store || !selectedDate || !selectedDate.isOpen) {
      return [];
    }
    let timeList = [];
    if (selectedDate.isToday) {
      timeList = storeUtils.getTodayTimeList(store, { currentDate, deliveryType, utcOffset: businessUTCOffset });
    } else {
      timeList = storeUtils.getPreOrderTimeList(store, deliveryType);
    }

    const isDelivery = deliveryType === DELIVERY_METHOD.DELIVERY;
    const date = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(selectedDate.date));

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

export default reducer;
