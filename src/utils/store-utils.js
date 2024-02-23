import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _flow from 'lodash/flow';
import _get from 'lodash/get';
import * as timeLib from './time-lib';
import { computeStraightDistance } from './geoUtils';
import Utils from './utils';
import Constants from './constants';

const { DELIVERY_METHOD, SH_LOGISTICS_VALID_TIME, TIME_SLOT_NOW } = Constants;

const MAX_PRE_ORDER_DATE = 5;

const UTC8_TIME_ZONE_OFFSET = 480;

dayjs.extend(utc);

/**
 * return merchant current time
 * @param {number} utcOffset  merchant time zone utc offset
 * @param {Date} date date obj, default is today
 * @returns {Dayjs}
 */
export const getBusinessDateTime = (utcOffset, date = new Date()) => dayjs(date).utcOffset(utcOffset);

/**
 * check whether dayOfWeek is in valid days
 * @param {number} dayOfWeek
 * @param {number[]} validDays
 * @returns {boolean}
 */
export const isInValidDays = (dayOfWeek, validDays) => {
  if (!validDays) {
    return false;
  }

  // validDays from api start from 1
  return validDays.includes(dayOfWeek + 1);
};

/**
 * check whether dateTime is in vacations
 * @param {Dayjs} dateTime
 * @param {Object} vacations
 * @param {string} vacations[].vacationTimeFrom
 * @param {string} vacations[].vacationTimeTo
 * @returns {boolean}
 */
export const isInVacations = (dateTime, vacations) => {
  if (!vacations) {
    return false;
  }

  const formatDate = dateTime.format('YYYY/MM/DD');

  const inVacation = vacations.some(
    ({ vacationTimeFrom, vacationTimeTo }) => formatDate >= vacationTimeFrom && formatDate <= vacationTimeTo
  );

  return inVacation;
};

/**
 * check whether time is in valid time
 * @param {string} time
 * @param {Object} param1
 * @param {string} param1.validTimeFrom
 * @param {string} param1.validTimeTo
 * @returns {boolean}
 */
export const isInValidTime = (time, { validTimeFrom, validTimeTo }) => {
  if (!timeLib.isValidTime(validTimeFrom) || !timeLib.isValidTime(validTimeTo)) {
    return false;
  }

  return timeLib.isBetween(time, { minTime: validTimeFrom, maxTime: validTimeTo }, '[]');
};

/**
 * check whether time is in break time
 * @param {string} time
 * @param {Object} param1
 * @param {string} param1.breakTimeFrom
 * @param {string} param1.breakTimeTo
 * @returns {boolean}
 */
export const isInBreakTime = (time, { breakTimeFrom, breakTimeTo }) => {
  if (!timeLib.isValidTime(breakTimeFrom) || !timeLib.isValidTime(breakTimeTo)) {
    return false;
  }

  return timeLib.isBetween(time, { minTime: breakTimeFrom, maxTime: breakTimeTo }, '[)');
};

/**
 *
 * @param {Store} store
 * @returns {object}
 */
export const getDeliveryPreOrderValidTimePeriod = store => {
  const { validTimeFrom, validTimeTo, useStorehubLogistics } = store.qrOrderingSettings;
  const addAndCeilToHour = _flow([timeLib.add, timeLib.ceilToHour]);

  // add 1 hour then ceil to hour, like 10:30 will get 12:00
  const preOrderValidTimeFrom = addAndCeilToHour(validTimeFrom, {
    value: 1,
    unit: 'hour',
  });

  if (!useStorehubLogistics) {
    return {
      validTimeFrom: preOrderValidTimeFrom,
      // floor hour, like 19:30 will get 19:00
      validTimeTo: timeLib.floorToHour(validTimeTo),
    };
  }

  const logisticsValidTimeFrom = timeLib.isBefore(preOrderValidTimeFrom, SH_LOGISTICS_VALID_TIME.FROM)
    ? SH_LOGISTICS_VALID_TIME.FROM
    : preOrderValidTimeFrom;
  const logisticsValidTimeTo = timeLib.isAfter(validTimeTo, SH_LOGISTICS_VALID_TIME.TO)
    ? SH_LOGISTICS_VALID_TIME.TO
    : validTimeTo;

  return {
    validTimeFrom: logisticsValidTimeFrom,
    // floor hour, like 19:30 will get 19:00
    validTimeTo: timeLib.floorToHour(logisticsValidTimeTo),
  };
};

export const getPickupPreOrderTimePeriod = store => {
  const { validTimeFrom, validTimeTo } = store.qrOrderingSettings;
  const addAndCeilToQuarter = _flow([timeLib.add, timeLib.ceilToQuarter]);

  return {
    validTimeFrom: addAndCeilToQuarter(validTimeFrom, {
      value: 30,
      unit: 'minute',
    }),
    validTimeTo,
  };
};

/**
 * delivery time list
 * @param {Store} store
 */
export const getDeliveryPreOrderTimeList = store => {
  if (!store) {
    return [];
  }

  const { qrOrderingSettings } = store;
  const { breakTimeFrom, breakTimeTo, enablePreOrder } = qrOrderingSettings;

  if (!enablePreOrder) {
    return [];
  }

  const { validTimeFrom, validTimeTo } = getDeliveryPreOrderValidTimePeriod(store);

  const timeList = [];

  for (
    let time = validTimeFrom;
    timeLib.isSameOrBefore(time, validTimeTo);
    time = timeLib.add(time, {
      value: 1,
      unit: 'hour',
    })
  ) {
    if (isInBreakTime(time, { breakTimeFrom, breakTimeTo })) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // remove 24:00
    if (timeLib.isSame(time, '24:00')) {
      // eslint-disable-next-line no-continue
      continue;
    }

    timeList.push(time);
  }

  return timeList;
};

/**
 * pickup time list
 * @param {Store} store
 */
export const getPickupPreOrderTimeList = store => {
  const { qrOrderingSettings } = store;
  const { validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo, enablePreOrder } = qrOrderingSettings;

  if (!enablePreOrder) {
    return [];
  }

  const preOrderValidTimeFrom = _flow([timeLib.add, timeLib.ceilToQuarter]).call(null, validTimeFrom, {
    value: 30,
    unit: 'minute',
  });

  const preOrderValidTimeTo = validTimeTo;

  const timeList = [];

  for (
    let time = preOrderValidTimeFrom;
    timeLib.isSameOrBefore(time, preOrderValidTimeTo);
    time = timeLib.add(time, {
      value: 15,
      unit: 'minute',
    })
  ) {
    if (
      isInBreakTime(time, { breakTimeFrom, breakTimeTo }) ||
      (timeLib.isValidTime(breakTimeTo) && timeLib.isSame(time, breakTimeTo))
    ) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // remove 24:00
    if (timeLib.isSame(time, '24:00')) {
      // eslint-disable-next-line no-continue
      continue;
    }

    timeList.push(time);
  }

  return timeList;
};

/**
 * check whether dateTime is available order time
 * @param {Store} store
 * @param {Date} dateTime
 * @returns {boolean}
 */
export const isAvailableOrderTime = (store, date, utcOffset, deliveryType = null) => {
  const {
    validDays,
    validTimeFrom: storeOpenTime,
    validTimeTo: storeCloseTime,
    breakTimeFrom,
    breakTimeTo,
    useStorehubLogistics,
    vacations,
  } = store.qrOrderingSettings;
  const dateTime = getBusinessDateTime(utcOffset, date);

  const dayOfWeek = dateTime.day();
  const time = timeLib.getTimeFromDayjs(dateTime);
  const isDelivery = deliveryType === DELIVERY_METHOD.DELIVERY;

  const logisticsValidTimeFrom =
    useStorehubLogistics && timeLib.isBefore(storeOpenTime, SH_LOGISTICS_VALID_TIME.FROM)
      ? SH_LOGISTICS_VALID_TIME.FROM
      : storeOpenTime;

  const logisticsValidTimeTo =
    useStorehubLogistics && timeLib.isAfter(storeCloseTime, SH_LOGISTICS_VALID_TIME.TO)
      ? SH_LOGISTICS_VALID_TIME.TO
      : storeCloseTime;

  const validTimeFrom = isDelivery ? logisticsValidTimeFrom : storeOpenTime;
  const validTimeTo = isDelivery ? logisticsValidTimeTo : storeCloseTime;

  return (
    isInValidDays(dayOfWeek, validDays) &&
    isInValidTime(time, { validTimeFrom, validTimeTo }) &&
    !isInBreakTime(time, { breakTimeFrom, breakTimeTo }) &&
    !isInVacations(dateTime, vacations)
  );
};

export const isAvailableOnDemandOrderTime = (store, date, utcOffset, deliveryType = null) => {
  const { enablePreOrder, disableOnDemandOrder } = store.qrOrderingSettings;

  // TODO: disableOnDemandOrder only work when enablePreOrder is true,backend will fix it later
  if (enablePreOrder && disableOnDemandOrder) {
    return false;
  }

  return isAvailableOrderTime(store, date, utcOffset, deliveryType);
};

export const getPickupTodayTimeList = (store, currentDate, utcOffset) => {
  const { disableTodayPreOrder, enablePreOrder } = store.qrOrderingSettings;
  const isAvailableOnDemandOrder = isAvailableOnDemandOrderTime(store, currentDate, utcOffset, DELIVERY_METHOD.PICKUP);
  const timeList = [];

  if (isAvailableOnDemandOrder) {
    timeList.push(TIME_SLOT_NOW);
  }

  if (!enablePreOrder || disableTodayPreOrder) {
    return timeList;
  }

  const current = getBusinessDateTime(utcOffset, currentDate);

  const time = timeLib.getTimeFromDayjs(current);
  const availablePreOrderValidTimeFrom = timeLib.add(time, { value: 30, unit: 'minute' });
  const pickupTimeList = getPickupPreOrderTimeList(store);

  const availableTimeList = pickupTimeList.filter(pickupTime =>
    timeLib.isAfter(pickupTime, availablePreOrderValidTimeFrom)
  );

  return timeList.concat(availableTimeList);
};

export const getDeliveryTodayTimeList = (store, currentDate, utcOffset) => {
  const { disableTodayPreOrder, disableTodayDeliveryPreOrder, enablePreOrder } = store.qrOrderingSettings;
  const isAvailableOnDemandOrder = isAvailableOnDemandOrderTime(
    store,
    currentDate,
    utcOffset,
    DELIVERY_METHOD.DELIVERY
  );
  const timeList = [];

  if (isAvailableOnDemandOrder) {
    timeList.push(TIME_SLOT_NOW);
  }

  if (!enablePreOrder || disableTodayPreOrder || disableTodayDeliveryPreOrder) {
    return timeList;
  }

  const current = getBusinessDateTime(utcOffset, currentDate);

  const time = timeLib.getTimeFromDayjs(current);
  const availablePreOrderValidTimeFrom = timeLib.add(time, { value: 1, unit: 'hour' });
  const deliveryTimeList = getDeliveryPreOrderTimeList(store);

  const availableTimeList = deliveryTimeList.filter(deliveryTime =>
    timeLib.isAfter(deliveryTime, availablePreOrderValidTimeFrom)
  );

  return timeList.concat(availableTimeList);
};

export const getTodayTimeList = (store, { todayDate, deliveryType, utcOffset }) => {
  switch (deliveryType) {
    case DELIVERY_METHOD.PICKUP:
      return getPickupTodayTimeList(store, todayDate, utcOffset);
    case DELIVERY_METHOD.DELIVERY:
      return getDeliveryTodayTimeList(store, todayDate, utcOffset);
    default:
      return [];
  }
};

/**
 * order time list
 * @param {Store} store
 * @param {string} deliveryType
 * @returns {string[]} timeList
 */
export const getPreOrderTimeList = (store, deliveryType) => {
  switch (deliveryType) {
    case DELIVERY_METHOD.DELIVERY:
      return getDeliveryPreOrderTimeList(store);
    case DELIVERY_METHOD.PICKUP:
      return getPickupPreOrderTimeList(store);
    default:
      return [];
  }
};

/**
 * get data list
 * @param {Store} store
 * @param {Date} currentDate
 * @returns {object[]} dateList
 */
export const getOrderDateList = (store, deliveryType, currentDate, utcOffset = UTC8_TIME_ZONE_OFFSET) => {
  if (!store) {
    return [];
  }

  const { qrOrderingSettings } = store;
  const { validDays, vacations, enablePreOrder } = qrOrderingSettings;

  const current = getBusinessDateTime(utcOffset, currentDate);

  const dateList = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < MAX_PRE_ORDER_DATE; i++) {
    const date = current.add(i, 'day').startOf('day');
    const isToday = i === 0;
    const dayOfWeek = date.day();
    const isOpen = isInValidDays(dayOfWeek, validDays) && !isInVacations(date, vacations);

    if (isToday) {
      const todayTimeList = getTodayTimeList(store, {
        todayDate: currentDate,
        deliveryType,
        utcOffset,
      });

      dateList.push({
        date: date.toDate(),
        isOpen: isOpen && todayTimeList.length > 0,
        isToday: true,
      });
    } else {
      dateList.push({
        date: date.toDate(),
        isOpen: enablePreOrder && isOpen,
        isToday: false,
      });
    }
  }

  return dateList;
};

/**
 * check store whether it is open or not at given time
 * @param {Date} dateTime
 * @param {Store} store
 * @returns {boolean}
 */
export const checkStoreIsOpened = (store, date, utcOffset) => {
  if (!date || !store) {
    return false;
  }

  const { qrOrderingSettings } = store;
  const { enablePreOrder, pauseModeEnabled } = qrOrderingSettings;

  if (pauseModeEnabled) {
    return false;
  }

  if (enablePreOrder) {
    return true;
  }

  return isAvailableOrderTime(store, date, utcOffset);
};

/**
 * get delivery available stores
 * @param {*} stores
 * @param {date} date
 * @returns {Store[]}
 */
export const filterDeliveryAvailableStores = (stores, date, utcOffset) =>
  stores.filter(store => {
    const { qrOrderingSettings, fulfillmentOptions } = store;
    if (!qrOrderingSettings) {
      return false;
    }

    if (!qrOrderingSettings.enableDeliveryLiveOnline) {
      return false;
    }

    const isSupportDelivery = fulfillmentOptions.some(type => type.toLowerCase() === DELIVERY_METHOD.DELIVERY);

    if (!isSupportDelivery) {
      return false;
    }

    const isStoreOpened = checkStoreIsOpened(store, date, utcOffset);

    if (!isStoreOpened) {
      return false;
    }

    return true;
  });

/**
 * find a store that nearest to specify geo location
 * @param {*} stores
 * @param {*} param1
 */
export const findNearestAvailableStore = (stores, { coords: { lat = 0, lng = 0 }, currentDate, utcOffset }) => {
  let nearlyStore = {
    distance: Infinity,
    store: null,
  };

  const availableStores = filterDeliveryAvailableStores(stores, currentDate, utcOffset);

  availableStores.forEach(store => {
    if (!store.location) {
      return;
    }
    const { latitude, longitude } = store.location;

    const distance = computeStraightDistance(
      { lat, lng },
      {
        lat: latitude,
        lng: longitude,
      }
    );

    if (distance < nearlyStore.distance) {
      nearlyStore = {
        distance,
        store,
      };
    }
  });

  return nearlyStore;
};

export const isDateTimeSoldOut = (store, soldData, selectedDate, utcOffset) => {
  const { enablePerTimeSlotLimitForPreOrder, maxPreOrdersPerTimeSlot } = store.qrOrderingSettings;
  if (!enablePerTimeSlotLimitForPreOrder) {
    return false;
  }

  const dateTime = getBusinessDateTime(utcOffset, selectedDate);

  const soldItem = soldData.find(item => dateTime.isSame(getBusinessDateTime(utcOffset, item.date), 'minute'));

  if (!soldItem) {
    return false;
  }

  return soldItem.count >= maxPreOrdersPerTimeSlot;
};

export const getSelectedOrderDateTimeList = (
  store,
  { selectedOrderDate, currentDate, deliveryType, businessUTCOffset }
) => {
  if (!store || !selectedOrderDate || !selectedOrderDate.isOpen) {
    return [];
  }

  if (selectedOrderDate.isToday) {
    return getTodayTimeList(store, { currentDate, deliveryType, utcOffset: businessUTCOffset });
  }

  return getPreOrderTimeList(store, deliveryType);
};

export const getStoreAvailableDateAndTime = (
  store,
  { expectedDay, expectedFromTime, deliveryType, currentDate, businessUTCOffset }
) => {
  const result = {
    orderDate: null,
    fromTime: null,
  };

  if (!store) {
    return result;
  }

  const orderDateList = getOrderDateList(store, deliveryType, currentDate, businessUTCOffset);
  const expectedOrderDate = expectedDay && orderDateList.find(orderDate => dayjs(orderDate.date).isSame(expectedDay));

  if (expectedOrderDate && expectedOrderDate.isOpen) {
    result.orderDate = expectedOrderDate;
  } else {
    const firstOpenOrderDate = orderDateList.find(orderDate => orderDate.isOpen);
    result.orderDate = firstOpenOrderDate;
  }

  if (result.orderDate) {
    const selectedOrderDateTimeList = getSelectedOrderDateTimeList(store, {
      currentDate,
      businessUTCOffset,
      selectedOrderDate: result.orderDate,
      deliveryType,
    });

    if (selectedOrderDateTimeList.includes(expectedFromTime)) {
      result.fromTime = expectedFromTime;
    } else {
      result.fromTime = _get(selectedOrderDateTimeList, 0, null);
    }
  }

  return result;
};

export const isEnablePerTimeSlotLimitForPreOrder = store =>
  _get(store, 'qrOrderingSettings.enablePerTimeSlotLimitForPreOrder', false);

export const getStoreInfoForCleverTap = ({ business, allBusinessInfo, cartSummary }) => {
  const originalInfo = allBusinessInfo[business] || {};
  const { qrOrderingSettings, defaultLoyaltyRatio, enableCashback, stores, country } = originalInfo || {};
  const { defaultShippingZone, minimumConsumption } = qrOrderingSettings || {};
  const { defaultShippingZoneMethod } = defaultShippingZone || {};
  const { freeShippingMinAmount, enableConditionalFreeShipping } = defaultShippingZoneMethod || {};
  const { id, name } = (stores && stores[0]) || {};
  const { subtotal, count } = cartSummary || {};

  const cashbackRate = defaultLoyaltyRatio ? Math.floor((1 / defaultLoyaltyRatio) * 100) / 100 : 0;
  const shippingType = Utils.getOrderTypeFromUrl() || 'unknown';

  const res = {
    'store name': name,
    'store id': id,
    'free delivery above': freeShippingMinAmount,
    'shipping type': shippingType,
    country,
  };

  if (enableCashback) {
    res.cashback = cashbackRate;
  }

  if (enableConditionalFreeShipping) {
    res['minimum order value'] = minimumConsumption;
  }

  if (cartSummary) {
    res['cart items quantity'] = count;
    res['cart amount'] = subtotal;
    res['has met minimum order value'] = subtotal >= minimumConsumption;
  }

  return res;
};
