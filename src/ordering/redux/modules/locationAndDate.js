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
const { DELIVERY_METHOD, TIME_SLOT_NOW } = Constants;

const initialState = {
  currentDate: null, // js Date Object
  deliveryType: null,
  storeId: null,
  deliveryAddress: '',
  deliveryCoords: null,
  selectedDay: null, // js Date Object
  selectedFromTime: null, // from time, like 09:00
  timeSlotSoldData: [],
  loading: false,
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
      loading: false,
    };

    dispatch(actions.showLoading(true));

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
      const { store } = storeUtils.findNearestAvailableStore(stores, {
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

    if (!store) {
      return dispatch({
        type: LOCATION_AND_DATE.INITIAL,
        payload,
      });
    }

    const enablePerTimeSlotLimitForPreOrder = storeUtils.isEnablePerTimeSlotLimitForPreOrder(store);
    const { orderDate, fromTime } = storeUtils.getStoreAvailableDateAndTime(store, {
      expectedDay,
      expectedFromTime,
      deliveryType,
      currentDate,
      businessUTCOffset,
    });

    payload.selectedDay = _get(orderDate, 'date', null);
    payload.selectedFromTime = fromTime;

    if (enablePerTimeSlotLimitForPreOrder && payload.selectedDay) {
      dispatch(
        actions.loadTimeSlotSoldData({
          deliveryType,
          selectedDay: payload.selectedDay,
          storeId: store.id,
        })
      );
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
        const { store: nearestStore } = storeUtils.findNearestAvailableStore(stores, {
          coords: deliveryCoords,
          currentDate: currentDate,
          utcOffset: businessUTCOffset,
        });

        payload.storeId = _get(nearestStore, 'id', null);
      } else {
        payload.storeId = null;
      }
    }

    if (!payload.storeId) {
      return dispatch({
        type: LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED,
        payload,
      });
    }

    store = getStoreById(getState(), payload.storeId);
    const enablePerTimeSlotLimitForPreOrder = storeUtils.isEnablePerTimeSlotLimitForPreOrder(store);
    const selectedDay = getSelectedDay(state);
    const selectedFromTime = getSelectedFromTime(state);

    const currentDate = getCurrentDate(state);
    const businessUTCOffset = getBusinessUTCOffset(state);

    const { orderDate, fromTime } = storeUtils.getStoreAvailableDateAndTime(store, {
      expectedDay: selectedDay,
      expectedFromTime: selectedFromTime,
      deliveryType,
      currentDate,
      businessUTCOffset,
    });

    payload.selectedDay = _get(orderDate, 'date', null);
    payload.selectedFromTime = fromTime;

    if (enablePerTimeSlotLimitForPreOrder && payload.selectedDay) {
      dispatch(
        actions.loadTimeSlotSoldData({
          deliveryType,
          selectedDay: payload.selectedDay,
          storeId: payload.storeId,
        })
      );
    }

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
    const selectedFromTime = getSelectedFromTime(state);

    const { orderDate, fromTime } = storeUtils.getStoreAvailableDateAndTime(store, {
      expectedDay: selectedDay,
      expectedFromTime: selectedFromTime,
      deliveryType,
      currentDate,
      businessUTCOffset,
    });

    payload.selectedDay = _get(orderDate, 'date', null);
    payload.selectedFromTime = fromTime;

    if (enablePerTimeSlotLimitForPreOrder && payload.selectedDay) {
      dispatch(actions.loadTimeSlotSoldData({ deliveryType, selectedDay: payload.selectedDay, storeId: store.id }));
    }

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

  showLoading: loading => ({
    type: LOCATION_AND_DATE.SHOW_LOADING,
    payload: loading,
  }),

  loadTimeSlotSoldData: ({ deliveryType, selectedDay, storeId }) => async dispatch => {
    try {
      const { method, url } = API_URLS.GET_TIME_SLOT(deliveryType, selectedDay.toISOString(), storeId);
      const timeSlotSoldData = await apiRequest[method](url);
      const payload = timeSlotSoldData.map(({ timeSlotStartDate, count }) => ({
        date: new Date(timeSlotStartDate),
        count,
      }));

      dispatch({
        type: LOCATION_AND_DATE.TIME_SLOT_SOLD_DATA_LOADED,
        payload: payload,
      });
    } catch (e) {
      console.error(e);

      dispatch({
        type: LOCATION_AND_DATE.TIME_SLOT_SOLD_DATA_LOADED,
        payload: [],
      });
    }
  },

  reset: () => ({
    type: LOCATION_AND_DATE.RESET,
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
        loading: action.payload.loading,
        selectedDay: action.payload.selectedDay,
        selectedFromTime: action.payload.selectedFromTime,
      };
    case LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED:
      return {
        ...state,
        deliveryType: action.payload.deliveryType,
        selectedDay: action.payload.selectedDay,
        selectedFromTime: action.payload.selectedFromTime,
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
      const { selectedDay, selectedFromTime } = action.payload;

      return {
        ...state,
        selectedDay,
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
        timeSlotSoldData: action.payload,
      };
    case LOCATION_AND_DATE.SHOW_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case LOCATION_AND_DATE.RESET:
      return {
        ...initialState,
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

    const oderDateList = storeUtils.getOrderDateList(store, deliveryType, currentDate, businessUTCOffset);
    const firstOrderDate = oderDateList[0];

    // delete today option if it is closed
    if (firstOrderDate && firstOrderDate.isToday && !firstOrderDate.isOpen) {
      oderDateList.shift();
    }

    return oderDateList;
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

    const timeList = storeUtils.getSelectedOrderDateTimeList(store, {
      selectedOrderDate,
      currentDate,
      deliveryType,
      businessUTCOffset,
    });

    const isDelivery = deliveryType === DELIVERY_METHOD.DELIVERY;
    const selectedDateDayjs = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(selectedOrderDate.date));

    return timeList.map(time => {
      if (time === TIME_SLOT_NOW) {
        return {
          soldOut: false,
          from: TIME_SLOT_NOW,
          to: TIME_SLOT_NOW,
        };
      }

      const selectedDateTime = timeLib.setDateTime(time, selectedDateDayjs);

      const soldOut = storeUtils.isDateTimeSoldOut(
        store,
        timeSlotSoldData,
        selectedDateTime.toDate(),
        businessUTCOffset
      );

      return {
        soldOut,
        from: time,
        to: isDelivery ? timeLib.add(time, { value: 1, unit: 'hour' }) : time,
      };
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

export const isShowLoading = state => _get(state.locationAndDate, 'loading', false);

export default reducer;
