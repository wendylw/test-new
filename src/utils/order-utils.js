import * as timeLib from './time-lib';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * check current time whether it is available to place on demand order
 * @param {*} param0
 * @returns {boolean}
 */
export const isAvailableOrderOnDemand = ({
  businessUTCOffset,
  validDays,
  validTimeFrom,
  validTimeTo,
  breakTimeFrom,
  breakTimeTo,
  vacations,
  disableOnDemandOrder,
}) => {
  if (disableOnDemandOrder) {
    return false;
  }

  const currentTime = getBusinessCurrentTime(businessUTCOffset);

  return isAvailableOrderTime(currentTime, {
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

  return timeLib.isBetween(time, { minTime: validTimeFrom, maxTime: validTimeTo }, '[)');
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
 * @returns {Dayjs}
 */
export const getBusinessCurrentTime = businessUTCOffset => {
  return dayjs().utcOffset(businessUTCOffset);
};
