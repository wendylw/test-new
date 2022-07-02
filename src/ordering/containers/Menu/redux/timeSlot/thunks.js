import { createAsyncThunk } from '@reduxjs/toolkit';
import _map from 'lodash/map';
import { getBusinessUTCOffset, getStore, actions as AppActions } from '../../../../redux/modules/app';
import {
  getBusinessTimeZoneCurrentDayjs,
  getCurrentTime,
  getExpectedDeliveryTime,
  getShippingType,
  getStoreId,
} from '../common/selectors';
import { fetchTimeSlotSoldData } from './api-request';
import {
  getIsEnablePerTimeSlotLimitForPreOrder,
  getSelectedDate,
  getSelectedDateObj,
  getSelectedShippingType,
  getSelectedTimeSlot,
} from './selectors';
import * as StoreUtils from '../../../../../utils/store-utils';
import { updateExpectedDeliveryDate } from '../common/thunks';
import { setDateTime } from '../../../../../utils/time-lib';

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

export const showTimeSlotDrawer = createAsyncThunk('ordering/menu/timeSlot/showTimeSlotDrawer', (_, { getState }) => {
  try {
    const state = getState();
    const store = getStore(state);
    const selectedShippingType = getShippingType(state);
    const expectedDeliveryTime = getExpectedDeliveryTime(state);
    const currentDayjs = getBusinessTimeZoneCurrentDayjs(state);
    const businessUTCOffset = getBusinessUTCOffset(state);

    if (!expectedDeliveryTime) {
      // find earliest available time slot
      const { orderDate, fromTime } = StoreUtils.getStoreAvailableDateAndTime(store, {
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

    const expectedDeliveryTimeDayjs = StoreUtils.getBusinessDateTime(businessUTCOffset, expectedDeliveryTime);

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

export const hideTimeSlotDrawer = createAsyncThunk('ordering/menu/timeSlot/hideTimeSlotDrawer', () => {});

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

      const { orderDate, fromTime } = StoreUtils.getStoreAvailableDateAndTime(store, {
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

export const changeDate = createAsyncThunk('ordering/menu/timeSlot/changeDate', value => value);

export const changeTimeSlot = createAsyncThunk('ordering/menu/timeSlot/changeTimeSlot', value => value);

export const save = createAsyncThunk('ordering/menu/timeSlot/save', (_, { getState, dispatch }) => {
  try {
    const state = getState();
    const selectedShippingType = getSelectedShippingType(state);
    const selectedDate = getSelectedDate(state);
    const selectedTimeSlot = getSelectedTimeSlot(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const expectedDeliveryDate = (() => {
      if (selectedTimeSlot === 'now') {
        return 'now';
      }

      const selectedDateBusinessTimeZone = StoreUtils.getBusinessDateTime(businessUTCOffset, selectedDate);

      return setDateTime(selectedTimeSlot, selectedDateBusinessTimeZone).toISOString();
    })();

    dispatch(AppActions.updateShippingType(selectedShippingType));

    dispatch(
      updateExpectedDeliveryDate({
        expectedDate: expectedDeliveryDate,
        shippingType: selectedShippingType,
      })
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
});
