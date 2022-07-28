import { createAsyncThunk } from '@reduxjs/toolkit';
import _map from 'lodash/map';
import {
  getBusinessUTCOffset,
  getStore,
  actions as AppActions,
  getIsEnablePerTimeSlotLimitForPreOrder,
  getStoreSupportShippingTypes,
  getStoreInfoForCleverTap,
} from '../../../../redux/modules/app';
import {
  getBusinessTimeZoneCurrentDayjs,
  getCurrentTime,
  getExpectedDeliveryTime,
  getShippingType,
  getStoreId,
} from '../common/selectors';
import { fetchTimeSlotSoldData } from './api-request';
import { getSelectedDate, getSelectedDateObj, getSelectedShippingType, getSelectedTimeSlot } from './selectors';
import * as storeUtils from '../../../../../utils/store-utils';
import { hideTimeSlotDrawer, updateExpectedDeliveryDate } from '../common/thunks';
import { setDateTime } from '../../../../../utils/time-lib';
import Clevertap from '../../../../../utils/clevertap';
import { SHIPPING_TYPES } from '../../../../../common/utils/constants';

export const loadTimeSlotSoldData = createAsyncThunk(
  'ordering/menu/timeSlot/loadTimeSlotSoldData',
  async ({ selectedDate, selectedShippingType }, { getState }) => {
    const state = getState();
    const isEnablePerTimeSlotLimitForPreOrder = getIsEnablePerTimeSlotLimitForPreOrder(state);
    const storeId = getStoreId(state);

    if (!isEnablePerTimeSlotLimitForPreOrder || !storeId || !selectedDate || !selectedShippingType) {
      return [];
    }

    const soldDate = await fetchTimeSlotSoldData({
      shippingType: selectedShippingType,
      fulfillDate: selectedDate,
      storeId,
    });

    return _map(soldDate, ({ timeSlotStartDate, count }) => ({
      date: timeSlotStartDate,
      count,
    }));
  }
);

// do some initializing stuff after time slow drawer shown
export const timeSlotDrawerShown = createAsyncThunk('ordering/menu/timeSlot/timeSlotDrawerShown', (_, { getState }) => {
  try {
    const state = getState();
    const store = getStore(state);
    const shippingType = getShippingType(state);
    const expectedDeliveryTime = getExpectedDeliveryTime(state);
    const currentDayjs = getBusinessTimeZoneCurrentDayjs(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const storeSupportShippingTypes = getStoreSupportShippingTypes(state);
    const selectedShippingType = storeSupportShippingTypes.includes(shippingType)
      ? shippingType
      : storeSupportShippingTypes[0];
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Timeslot - view page', storeInfoForCleverTap);

    if (!expectedDeliveryTime) {
      // find earliest available time slot
      const { orderDate, fromTime } = storeUtils.getStoreAvailableDateAndTime(store, {
        expectedDay: null,
        expectedFromTime: null,
        deliveryType: selectedShippingType,
        currentDate: currentDayjs.toDate(),
        businessUTCOffset,
      });

      return {
        selectedShippingType,
        selectedDate: orderDate?.date?.toISOString(),
        selectedTimeSlot: fromTime,
      };
    }

    if (expectedDeliveryTime === 'now') {
      const selectedDate = currentDayjs.startOf('day').toISOString();

      return {
        selectedShippingType,
        selectedDate,
        selectedTimeSlot: 'now',
      };
    }

    const expectedDeliveryTimeDayjs = storeUtils.getBusinessDateTime(businessUTCOffset, expectedDeliveryTime);

    const selectedDate = expectedDeliveryTimeDayjs.startOf('day').toISOString();

    return {
      selectedShippingType,
      selectedDate,
      selectedTimeSlot: expectedDeliveryTimeDayjs.format('HH:mm'),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
});

// Do some clean up job after time slot drawer hidden
export const timeSlotDrawerHidden = createAsyncThunk('ordering/menu/timeSlot/hideTimeSlotDrawer', () => {});

export const changeShippingType = createAsyncThunk(
  'ordering/menu/timeSlot/changeShippingType',
  (shippingType, { getState }) => {
    try {
      const state = getState();
      const store = getStore(state);
      const selectedDateObj = getSelectedDateObj(state);
      const selectedTimeSlot = getSelectedTimeSlot(state);
      const currentTime = getCurrentTime(state);
      const businessUTCOffset = getBusinessUTCOffset(state);
      const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
      const eventName =
        shippingType === SHIPPING_TYPES.DELIVERY ? 'Timeslot - click delivery tab' : 'Timeslot - click pickup tab';

      Clevertap.pushEvent(eventName, storeInfoForCleverTap);

      // check current selected time whether available for new selected shippingType
      // if not, find the earliest available time
      const { orderDate, fromTime } = storeUtils.getStoreAvailableDateAndTime(store, {
        expectedDay: new Date(selectedDateObj.value),
        expectedFromTime: selectedTimeSlot,
        deliveryType: shippingType,
        currentDate: new Date(currentTime),
        businessUTCOffset,
      });

      return {
        selectedShippingType: shippingType,
        selectedDate: orderDate?.date?.toISOString(),
        selectedTimeSlot: fromTime,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const changeDate = createAsyncThunk('ordering/menu/timeSlot/changeDate', (value, { getState }) => {
  try {
    const state = getState();
    const store = getStore(state);
    const selectedShippingType = getSelectedShippingType(state);
    const currentTime = getCurrentTime(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const selectedTimeSlot = getSelectedTimeSlot(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Timeslot - click shipping date', storeInfoForCleverTap);

    // check current selected time whether available for new selected date
    // if not, find the earliest available time
    const { orderDate, fromTime } = storeUtils.getStoreAvailableDateAndTime(store, {
      expectedDay: new Date(value),
      expectedFromTime: selectedTimeSlot,
      deliveryType: selectedShippingType,
      currentDate: new Date(currentTime),
      businessUTCOffset,
    });

    return {
      selectedDate: orderDate?.date?.toISOString(),
      selectedTimeSlot: fromTime,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const changeTimeSlot = createAsyncThunk('ordering/menu/timeSlot/changeTimeSlot', (value, { getState }) => {
  const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

  Clevertap.pushEvent('Timeslot - click shipping time', storeInfoForCleverTap);

  return value;
});

export const save = createAsyncThunk('ordering/menu/timeSlot/save', async (_, { getState, dispatch }) => {
  try {
    const state = getState();
    const selectedShippingType = getSelectedShippingType(state);
    const selectedDate = getSelectedDate(state);
    const selectedTimeSlot = getSelectedTimeSlot(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const shippingType = getShippingType(state);
    const expectedDeliveryTime = getExpectedDeliveryTime(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Timeslot - confirm', storeInfoForCleverTap);

    const selectedExpectedDeliveryTime = (() => {
      if (selectedTimeSlot === 'now') {
        return 'now';
      }

      const selectedDateBusinessTimeZone = storeUtils.getBusinessDateTime(businessUTCOffset, selectedDate);

      return setDateTime(selectedTimeSlot, selectedDateBusinessTimeZone).toISOString();
    })();

    dispatch(AppActions.updateShippingType(selectedShippingType));

    dispatch(
      updateExpectedDeliveryDate({
        expectedDate: selectedExpectedDeliveryTime,
        shippingType: selectedShippingType,
      })
    );

    if (selectedShippingType !== shippingType || expectedDeliveryTime !== selectedExpectedDeliveryTime) {
      // need to reload the shopping cart and product list
      dispatch(AppActions.loadShoppingCart());
      dispatch(AppActions.loadProductList());
    }

    dispatch(hideTimeSlotDrawer());
  } catch (error) {
    console.error(error);
    throw error;
  }
});
