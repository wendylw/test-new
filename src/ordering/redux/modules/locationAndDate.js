import { LOCATION_AND_DATE } from '../types';
import _get from 'lodash/get';
import Constants from '../../../utils/constants';
import * as storeUtils from '../../../utils/store-utils';
import * as apiRequest from '../../../utils/request';
import * as timeLib from '../../../utils/time-lib';
import URL from '../../../utils/url';
import { getStoreById, getAllStores } from '../../../redux/modules/entities/stores';
import { getBusinessUTCOffset, getBusinessInfo } from './app';
import { actions as homeActions } from './home';

import { createSelector } from 'reselect';

const { API_URLS } = URL;
const { DELIVERY_METHOD } = Constants;

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
  initialState: ({ deliveryType, storeId, deliveryAddress }) => async (dispatch, getState) => {
    const isDelivery = deliveryType === DELIVERY_METHOD.DELIVERY;
    const payload = {
      currentDate: new Date(),
      deliveryType,
      storeId,
      deliveryAddress,
    };

    await dispatch(homeActions.loadCoreStores());

    // find nearly store by delivery address
    if (!storeId && isDelivery && deliveryAddress && deliveryAddress.coords) {
      const state = getState();
      const stores = getAllStores(state);
      const store = storeUtils.findNearlyStore(stores, deliveryAddress.coords);
      if (store) {
        payload.storeId = store.id;
      }
    }

    return dispatch({
      type: LOCATION_AND_DATE.INITIAL_STATE,
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

  selectedDateChanged: selectedDate => async (dispatch, getState) => {
    dispatch({
      type: LOCATION_AND_DATE.DELIVERY_DATE_CHANGED,
      payload: selectedDate,
    });

    try {
      const state = getState();
      const deliveryType = getDeliveryType(state);
      const store = getStore(state);
      if (!store.enablePerTimeSlotLimitForPreOrder) {
        return;
      }

      const { method, url } = API_URLS.GET_TIME_SLOT(deliveryType, selectedDate.date, store.id);

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
    case LOCATION_AND_DATE.INITIAL_STATE:
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
  const businessStore = _get(businessInfo, 'stores.0', null);
  if (!businessStore || businessStore.id !== storeId) {
    return Object.assign(store.qrOrderingSettings, {
      enablePerTimeSlotLimitForPreOrder: false,
      maxPreOrdersPerTimeSlot: 0,
    });
  }

  return Object.assign(store.qrOrderingSettings, {
    enablePerTimeSlotLimitForPreOrder: businessStore.qrOrderingSettings.enablePerTimeSlotLimitForPreOrder,
    maxPreOrdersPerTimeSlot: businessStore.qrOrderingSettings.maxPreOrdersPerTimeSlot,
  });
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
  getCurrentDate,
  getBusinessUTCOffset,
  (store, currentDate, businessUTCOffset) => storeUtils.getOrderDateList(store, currentDate, businessUTCOffset)
);

export const getAvailableTimeSlotList = createSelector(
  [getStore, getCurrentDate, getBusinessUTCOffset, getSelectedDate, getDeliveryType, getTimeSlotSoldData],
  (store, currentDate, businessUTCOffset, selectedDate, deliveryType, timeSlotSoldData) => {
    if (!selectedDate.isOpen) {
      return [];
    }
    let timeList = [];
    if (selectedDate.isToday) {
      timeList = storeUtils.getTodayTimeList(store, currentDate, deliveryType);
    } else {
      timeList = storeUtils.getPreOrderTimeList(store, deliveryType);
    }

    const date = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(selectedDate.date));

    return timeList.map(time => {
      const dateTime = timeLib.setDateTime(time, date);

      const soldOut = storeUtils.isDateTimeSoldOut(store, timeSlotSoldData, dateTime.toDate(), businessUTCOffset);

      if (deliveryType === DELIVERY_METHOD.DELIVERY) {
        return {
          soldOut,
          from: time,
          to: timeLib.add(time, { value: 1, unit: 'hour' }),
        };
      }

      return {
        soldOut,
        from: time,
      };
    });
  }
);

export default reducer;
