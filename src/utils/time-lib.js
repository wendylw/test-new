import invariant from 'invariant';
import { padZero } from './datetime-lib';
import dayjs from 'dayjs';

const InvalidTimeErrorMessage = 'Invalid time string form';

/**
 * add a specified amount of time
 * @param {string} time time like "10:30"
 * @param {Object} param1
 * @param {number} param1.value added amount
 * @param {string} param1.unit hour or minute
 * @returns {string} time
 */
export const add = (time, { value, unit }) => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  const amountOfMinutes = getAmountOfMinutes(time);
  const minutes = toMinutes(Number(value), unit);

  return minutesToTime(amountOfMinutes + minutes);
};

/**
 * minus a specified amount of time
 * @param {string} time time like "10:30"
 * @param {Object} param1
 * @param {number} param1.value added amount
 * @param {string} param1.unit "hour" or "minute"
 * @returns {string} time
 */
export const minus = (time, { value, unit }) => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  return add(time, {
    value: -value,
    unit,
  });
};

/**
 * parse a time to a object {hour, minute}
 * @param {string} time
 * @returns {Object} {hour, minute}
 */
export const parse = time => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  const [hour, minute] = time.split(':');

  return {
    hour: Number(hour),
    minute: Number(minute),
  };
};

/**
 * stringify a time object {hour, minute} to a time string
 * @param {Object} param0
 * @param {number} param0.hour hour
 * @param {number} param0.minute minute
 * @returns {string} time string
 */
export const stringify = ({ hour, minute }) => {
  const h = Math.floor(minute / 60);
  const m = Math.abs(minute % 60);

  return `${padZero(hour + h)}:${padZero(m)}`;
};

/**
 * indicates whether before the supplied time
 * @param {string} time
 * @param {string} compareTime
 * @returns {boolean} result
 */
export const isBefore = (time, compareTime) => {
  invariant(isValidTime(time) && isValidTime(compareTime), InvalidTimeErrorMessage);

  return getAmountOfMinutes(time) < getAmountOfMinutes(compareTime);
};

/**
 * indicates whether after the supplied time
 * @param {string} time
 * @param {string} compareTime
 * @returns {boolean} result
 */
export const isAfter = (time, compareTime) => {
  invariant(isValidTime(time) && isValidTime(compareTime), InvalidTimeErrorMessage);

  return getAmountOfMinutes(time) > getAmountOfMinutes(compareTime);
};

/**
 * indicates whether same the supplied time
 * @param {string} time
 * @param {string} compareTime
 * @returns {boolean} result
 */
export const isSame = (time, compareTime) => {
  invariant(isValidTime(time) && isValidTime(compareTime), InvalidTimeErrorMessage);

  return getAmountOfMinutes(time) === getAmountOfMinutes(compareTime);
};

/**
 * indicates whether same or before the supplied time
 * @param {string} time
 * @param {string} compareTime
 * @returns {boolean} result
 */
export const isSameOrBefore = (time, compareTime) => {
  invariant(isValidTime(time) && isValidTime(compareTime), InvalidTimeErrorMessage);

  return isSame(time, compareTime) || isBefore(time, compareTime);
};

/**
 * indicates whether same or after the supplied time
 * @param {string} time
 * @param {string} compareTime
 * @returns {boolean} result
 */
export const isSameOrAfter = (time, compareTime) => {
  invariant(isValidTime(time) && isValidTime(compareTime), InvalidTimeErrorMessage);

  return isSame(time, compareTime) || isAfter(time, compareTime);
};

/**
 * indicates whether same or after the two supplied time
 * @param {string} time
 * @param {object} param1
 * @param {string} param1.minTime time string
 * @param {string} param1.maxTime time string
 * @param {string} [inclusivity=()] [ indicates inclusion of a value. ( indicates exclusion
 * @returns {boolean} result
 * @throws will throw an error if time of argument is invalid or inclusivity is wrong
 */
export const isBetween = (time, { minTime, maxTime }, inclusivity = '()') => {
  invariant(isValidTime(time) && isValidTime(minTime) && isValidTime(maxTime), InvalidTimeErrorMessage);

  switch (inclusivity) {
    case '()':
      return isAfter(time, minTime) && isBefore(time, maxTime);
    case '[)':
      return isSameOrAfter(time, minTime) && isBefore(time, maxTime);
    case '(]':
      return isAfter(time, minTime) && isSameOrBefore(time, maxTime);
    case '[]':
      return isSameOrAfter(time, minTime) && isSameOrBefore(time, maxTime);
    default:
      throw new Error("Invalid argument of 'inclusivity'");
  }
};

/**
 * get the time amount of minutes from 00:00
 * @param {string} time
 * @returns {number} amount of minutes
 */
export const getAmountOfMinutes = time => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  const { hour, minute } = parse(time);
  return toMinutes(hour, 'hour') + minute;
};

/**
 * calculate specify value and unit amount of minutes
 * @param {number} value
 * @param {string} unit "hour" or "minute"
 * @returns {number} amount of minutes
 */
export const toMinutes = (value, unit) => {
  switch (unit) {
    case 'hour':
      return Number(value) * 60;
    case 'minute':
      return Number(value);
    default:
      throw new Error("Invalid argument of 'unit'");
  }
};

/**
 * calculate minutes corresponding time from 00:00
 * @param {number} minutes
 * @returns time string
 */
export const minutesToTime = minutes => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes - hour * 60;

  return stringify({ hour, minute });
};

/**
 * is valid time string
 * @param {string} time
 * @returns {boolean} result
 */
export const isValidTime = time => {
  try {
    const regex = /^-?\d+:[0-5]\d$/;
    return regex.test(time);
  } catch (e) {
    return false;
  }
};

/**
 * set dayjs hour and minute by time
 * @param {string} time
 * @param {Dayjs} date
 * @return {Dayjs}
 */
export const setDateTime = (time, date = dayjs()) => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);
  invariant(dayjs.isDayjs(date), 'Not Dayjs object');

  const { hour, minute } = parse(time);
  return date
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);
};

/**
 * get dayjs time
 * @param {Dayjs} date
 */
export const getTimeFromDayjs = (date = dayjs()) => {
  invariant(dayjs.isDayjs(date), 'Not Dayjs object');

  return date.format('HH:mm');
};
