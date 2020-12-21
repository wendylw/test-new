import * as timeLib from './time-lib';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

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
