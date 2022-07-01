import { createAsyncThunk } from '@reduxjs/toolkit';
import _map from 'lodash/map';
import { getBusinessUTCOffset } from '../../../../redux/modules/app';
import {
  getBusinessTimeZoneCurrentDayjs,
  getExpectedDeliveryTime,
  getShippingType,
  getStoreId,
} from '../common/selectors';
import { fetchTimeSlotSoldData } from './api-request';
import { getIsEnablePerTimeSlotLimitForPreOrder } from './selectors';
import * as StoreUtils from '../../../../../utils/store-utils';

export const loadTimeSlotSoldData = createAsyncThunk(
  'ordering/menu/timeSlot/loadTimeSlotSoldData',
  async ({ selectedDate, selectedShippingType }, { getState }) => {
    const state = getState();
    const storeId = getStoreId(state);
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

export const showTimeSlotDrawer = createAsyncThunk(
  'ordering/menu/timeSlot/showTimeSlotDrawer',
  (_, { getState, dispatch }) => {
    const state = getState();
    const selectedShippingType = getShippingType(state);
    const expectedDeliveryTime = getExpectedDeliveryTime(state);
    const isEnablePerTimeSlotLimitForPreOrder = getIsEnablePerTimeSlotLimitForPreOrder(state);
    const currentDayjs = getBusinessTimeZoneCurrentDayjs(state);
    const businessUTCOffset = getBusinessUTCOffset(state);

    if (!expectedDeliveryTime) {
      return {
        selectedShippingType,
        selectedDate: null,
        selectedTimeSlot: null,
      };
    }

    if (expectedDeliveryTime === 'now') {
      const selectedDate = currentDayjs.startOf('day').toISOString();
      if (isEnablePerTimeSlotLimitForPreOrder) {
        dispatch(
          loadTimeSlotSoldData({
            selectedDate,
            selectedShippingType,
          })
        );
      }

      return {
        selectedShippingType,
        selectedDate,
        selectedTimeSlot: 'now',
      };
    }

    const expectedDeliveryTimeDayjs = StoreUtils.getBusinessDateTime(businessUTCOffset, expectedDeliveryTime);

    const selectedDate = expectedDeliveryTimeDayjs.startOf('day').toISOString();

    if (isEnablePerTimeSlotLimitForPreOrder) {
      dispatch(
        loadTimeSlotSoldData({
          selectedDate,
          selectedShippingType,
        })
      );
    }

    return {
      selectedShippingType,
      selectedDate,
      selectedTimeSlot: expectedDeliveryTimeDayjs.format('HH:mm'),
    };
  }
);

export const hideTimeSlotDrawer = createAsyncThunk('ordering/menu/timeSlot/hideTimeSlotDrawer', () => {});

export const changeShippingType = createAsyncThunk('ordering/menu/timeSlot/changeShippingType', shippingType => {});

export const changeDate = createAsyncThunk('ordering/menu/timeSlot/changeDate', value => {});

export const changeTimeSlot = createAsyncThunk('ordering/menu/timeSlot/changeTimeSlot', value => {});

export const save = createAsyncThunk('ordering/menu/timeSlot/save', () => {});
