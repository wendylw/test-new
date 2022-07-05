import { createSelector } from 'reselect';
import _lowerCase from 'lodash/lowerCase';
import _get from 'lodash/get';
import { API_REQUEST_STATUS, SHIPPING_TYPES } from '../../../../../common/utils/constants';
import { getBusinessUTCOffset, getStore } from '../../../../redux/modules/app';
import { getCurrentTime, getStoreStatus } from '../common/selectors';
import * as storeUtils from '../../../../../utils/store-utils';
import * as timeLib from '../../../../../utils/time-lib';
import { STORE_OPENING_STATUS } from '../../constants';

export const getStoreFulfillmentOptions = createSelector(getStore, store => _get(store, 'fulfillmentOptions', []));

export const getIsEnablePerTimeSlotLimitForPreOrder = createSelector(getStore, store =>
  _get(store, 'qrOrderingSettings.enablePerTimeSlotLimitForPreOrder', false)
);

export const getStoreSupportShippingTypes = createSelector(getStoreFulfillmentOptions, storeFulfillmentOptions =>
  storeFulfillmentOptions.map(_lowerCase)
);

export const getIsOnlyPreOrder = createSelector(
  getStoreStatus,
  storeStatus => storeStatus === STORE_OPENING_STATUS.PRE_ORDER
);

export const getTimeSlotState = state => state.menu.timeSlot;

export const getTimeSlotDrawerVisible = createSelector(
  getTimeSlotState,
  timeSlotState => timeSlotState.timeSlotDrawerVisible
);

export const getSelectedShippingType = createSelector(
  getTimeSlotState,
  timeSlotState => timeSlotState.selectedShippingType
);

export const getSelectedDate = createSelector(getTimeSlotState, timeSlotState => timeSlotState.selectedDate);

export const getSelectedTimeSlot = createSelector(getTimeSlotState, timeSlotState => timeSlotState.selectedTimeSlot);

export const getIsInitializing = createSelector(
  getTimeSlotState,
  timeSlotState => timeSlotState.showTimeSlotDrawerRequest.status === API_REQUEST_STATUS.PENDING
);

export const getTimeSlotSoldRequest = createSelector(
  getTimeSlotState,
  timeSlotState => timeSlotState.timeSlotSoldRequest
);

export const getSaveRequest = createSelector(getTimeSlotState, timeSlotState => timeSlotState.saveRequest);

export const getSaveRequestStatus = createSelector(getSaveRequest, saveRequest => saveRequest.status);

export const getTimeSlotSoldData = createSelector(
  getTimeSlotSoldRequest,
  timeSlotSoldRequest => timeSlotSoldRequest.data
);

export const getTimeSlotSoldStatus = createSelector(
  getTimeSlotSoldRequest,
  timeSlotSoldRequest => timeSlotSoldRequest.status
);

export const getTimeSlotSoldError = createSelector(
  getTimeSlotSoldRequest,
  timeSlotSoldRequest => timeSlotSoldRequest.error
);

export const getShippingTypeList = createSelector(
  getStoreSupportShippingTypes,
  getSelectedShippingType,
  (supportShippingTypes, selectedShippingType) => [
    {
      value: SHIPPING_TYPES.DELIVERY,
      available: supportShippingTypes.includes(SHIPPING_TYPES.DELIVERY),
      selected: selectedShippingType === SHIPPING_TYPES.DELIVERY,
    },
    {
      value: SHIPPING_TYPES.PICKUP,
      available: supportShippingTypes.includes(SHIPPING_TYPES.PICKUP),
      selected: selectedShippingType === SHIPPING_TYPES.PICKUP,
    },
  ]
);

export const getSelectedShippingTypeObj = createSelector(getShippingTypeList, shippingTypeList =>
  shippingTypeList.find(({ selected }) => selected)
);

export const getDateList = createSelector(
  getSelectedDate,
  getStore,
  getSelectedShippingType,
  getCurrentTime,
  getBusinessUTCOffset,
  (selectedDate, store, selectedShippingType, currentTime, businessUTCOffset) => {
    if (!store) {
      return [];
    }

    const oderDateList = storeUtils.getOrderDateList(store, selectedShippingType, currentTime, businessUTCOffset);

    return oderDateList.map(({ date, isOpen, isToday }) => {
      const dateDayJs = storeUtils.getBusinessDateTime(businessUTCOffset, date);
      const currentTimeDayJs = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(currentTime));
      const tomorrowDateDayJs = currentTimeDayJs.clone().add(1, 'days');

      return {
        value: dateDayJs.toISOString(), // date string, IOS date String format, example: "2022-06-30T16:00:00.000Z"
        displayMonth: dateDayJs.format('MMM'), // month string, example: "Jun"
        displayDay: dateDayJs.format('D'), // day string, example: "30"
        available: isOpen,
        selected: dateDayJs.isSame(selectedDate, 'day'),
        isToday,
        isTomorrow: dateDayJs.isSame(tomorrowDateDayJs, 'day'),
      };
    });
  }
);

export const getSelectedDateObj = createSelector(getDateList, selectedDate =>
  selectedDate.find(({ selected }) => selected)
);

export const getTimeSlotList = createSelector(
  getStore,
  getSelectedTimeSlot,
  getCurrentTime,
  getBusinessUTCOffset,
  getSelectedDateObj,
  getSelectedShippingType,
  getTimeSlotSoldData,
  (
    store,
    selectedTimeSlot,
    currentTime,
    businessUTCOffset,
    selectedDateObj,
    selectedShippingType,
    timeSlotSoldData
  ) => {
    if (!store || !selectedDateObj || !selectedDateObj.available) {
      return [];
    }

    const currentDate = new Date(currentTime);

    const selectedDateDayjs = storeUtils.getBusinessDateTime(businessUTCOffset, selectedDateObj.value);

    const timeSlotList = (() => {
      if (selectedDateObj.isToday) {
        return storeUtils.getTodayTimeList(store, {
          todayDate: currentDate,
          deliveryType: selectedShippingType,
          utcOffset: businessUTCOffset,
        });
      }
      return storeUtils.getPreOrderTimeList(store, selectedShippingType);
    })();

    return timeSlotList.map(time => {
      if (time === 'now') {
        return {
          value: 'now',
          from: 'Immediate',
          to: 'Immediate',
          available: true,
          soldOut: false,
          selected: selectedTimeSlot === 'now',
        };
      }

      // delivery time slot will display as 'from - to'
      const toTime =
        selectedShippingType === SHIPPING_TYPES.DELIVERY ? timeLib.add(time, { value: 1, unit: 'hour' }) : time;

      const selectedTime = timeLib.setDateTime(time, selectedDateDayjs);

      const soldOut = storeUtils.isDateTimeSoldOut(store, timeSlotSoldData, selectedTime.toDate(), businessUTCOffset);

      return {
        value: time,
        from: timeLib.formatTime(time),
        to: timeLib.formatTime(toTime),
        available: !soldOut,
        soldOut,
        selected: selectedTimeSlot === time,
      };
    });
  }
);

export const getSelectedTimeSlotObj = createSelector(getTimeSlotList, timeSlotList =>
  timeSlotList.find(({ selected }) => selected)
);

export const getIsSaveButtonDisabled = createSelector(
  getSelectedShippingTypeObj,
  getSelectedDateObj,
  getSelectedTimeSlotObj,
  (selectedShippingTypeObj, selectedDateObj, selectedTimeSlotObj) =>
    !selectedShippingTypeObj?.available || !selectedDateObj?.available || !selectedTimeSlotObj?.available
);
