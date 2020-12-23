import * as timeLib from './time-lib';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { computeStraightDistance } from './geoUtils';
import Constants from './constants';

const { DELIVERY_METHOD } = Constants;

dayjs.extend(utc);

export const getAvailableOrderDateList = (currentDate, store) => {
  const { qrOrderingSettings } = store;

  return [
    {
      date: '',
      isOpen: true,
      isToday: true,
    },
  ];
};

export const getAvailableOrderTimeList = (deliveryType, store) => {
  return ['08:00', '09:00', '10:00', '13:00', '14:00'];
};

export const filterDeliveryAvailableStores = (dateTime, stores) => {
  return stores.filter(store => {
    const { qrOrderingSettings, fulfillmentOptions } = store;
    if (!qrOrderingSettings) {
      return false;
    }

    if (!qrOrderingSettings.enableLiveOnline) {
      return false;
    }

    const isSupportDelivery = fulfillmentOptions.some(type => type.toLowerCase() === DELIVERY_METHOD.DELIVERY);

    if (!isSupportDelivery) {
      return false;
    }

    const isStoreOpened = checkStoreIsOpened(dateTime, store);

    if (!isStoreOpened) {
      return false;
    }

    return true;
  });
};

export const checkStoreIsOpened = (dateTime, store) => {
  const { qrOrderingSettings } = store;
  const {
    enablePreOrder,
    validDays,
    validTimeFrom,
    validTimeTo,
    breakTimeFrom,
    breakTimeTo,
    vacations,
    disableOnDemandOrder,
  } = qrOrderingSettings;

  if (enablePreOrder) {
    return true;
  }

  return (
    enablePreOrder ||
    isAvailableOrderOnDemand({
      businessUTCOffset,
      validDays,
      validTimeFrom,
      validTimeTo,
      breakTimeFrom,
      breakTimeTo,
      vacations,
      disableOnDemandOrder,
    })
  );
};

export const findNearlyStore = ({ lat, lng }, stores) => {
  let nearlyStore = {
    distance: 0,
    store: null,
  };

  stores.forEach(store => {
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

    if (distance > nearlyStore.distance) {
      nearlyStore = {
        distance,
        store,
      };
    }
  });

  return nearlyStore.store;
};

/**
 * check store whether it is open or not at given time
 * @param {Dayjs} dateTime
 * @param {Store} store
 * @returns {boolean}
 */
export const checkStoreIsOpened = (dateTime, store) => {
  if (!dateTime || !store) {
    return false;
  }

  const { qrOrderingSettings } = store;
  const {
    enablePreOrder,
    validDays,
    validTimeFrom,
    validTimeTo,
    breakTimeFrom,
    breakTimeTo,
    vacations,
  } = qrOrderingSettings;

  if (enablePreOrder) {
    return true;
  }

  return isAvailableOrderTime(dateTime, {
    validDays,
    validTimeFrom,
    validTimeTo,
    breakTimeFrom,
    breakTimeTo,
    vacations,
  });
};

/**
 * check whether dateTime is available order time
 * @param {Dayjs} dateTime
 * @param {object} param1
 * @returns {boolean}
 */
export const isAvailableOrderTime = (
  dateTime,
  { validDays, validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo, vacations }
) => {
  return (
    isInValidDays(dateTime, validDays) &&
    isInValidTime(dateTime, { validTimeFrom, validTimeTo }) &&
    !isInBreakTime(dateTime, { breakTimeFrom, breakTimeTo }) &&
    !isInVacations(dateTime, vacations)
  );
};

/**
 * check whether dateTime is in valid days
 * @param {Dayjs} dateTime
 * @param {number[]} validDays
 * @returns {boolean}
 */
export const isInValidDays = (dateTime, validDays) => {
  if (!validDays) {
    return false;
  }

  const day = dateTime.day();
  // validDays from api start from 1
  return validDays.includes(day + 1);
};

/**
 * check whether dateTime is in valid time
 * @param {Dayjs} dateTime
 * @param {Object} param1
 * @param {string} param1.validTimeFrom
 * @param {string} param1.validTimeTo
 * @returns {boolean}
 */
export const isInValidTime = (dateTime, { validTimeFrom, validTimeTo }) => {
  if (!timeLib.isValidTime(validTimeFrom) || !timeLib.isValidTime(validTimeTo)) {
    return false;
  }

  const time = timeLib.getTimeFromDayjs(dateTime);

  return timeLib.isBetween(time, { minTime: validTimeFrom, maxTime: validTimeTo }, '[]');
};

/**
 * check whether dateTime is in break time
 * @param {Dayjs} dateTime
 * @param {Object} param1
 * @param {string} param1.breakTimeFrom
 * @param {string} param1.breakTimeTo
 * @returns {boolean}
 */
export const isInBreakTime = (dateTime, { breakTimeFrom, breakTimeTo }) => {
  if (!timeLib.isValidTime(breakTimeFrom) || !timeLib.isValidTime(breakTimeTo)) {
    return false;
  }

  const time = timeLib.getTimeFromDayjs(dateTime);

  return timeLib.isBetween(time, { minTime: breakTimeFrom, maxTime: breakTimeTo }, '[)');
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

  const inVacation = vacations.some(({ vacationTimeFrom, vacationTimeTo }) => {
    return formatDate >= vacationTimeFrom && formatDate <= vacationTimeTo;
  });

  return inVacation;
};
/**
 * return merchant current time
 * @param {number} businessUTCOffset  merchant time zone utc offset
 * @param {Date} date date obj, default is today
 * @returns {Dayjs}
 */
export const getBusinessDateTime = (businessUTCOffset, date = new Date()) => {
  // TODO: will add the merchant utc offset later
  // return dayjs(date).utcOffset(businessUTCOffset);
  return dayjs(date);
};
