import invariant from 'invariant';
import dayjs from 'dayjs';

const InvalidTimeErrorMessage = 'Invalid time string format';

/**
 * pad zero
 * @param {number} num
 * @returns {string}
 */
export const padZero = num => {
  const str = num.toString();
  if (str.length === 1) {
    return `0${str}`;
  }
  return str;
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
  // if minute over 60, need enters 1 hour
  const h = Math.floor(minute / 60);
  const m = minute - h * 60;

  return `${padZero(hour + h)}:${padZero(m)}`;
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
  if (!isValidTime(time) || !isValidTime(compareTime)) {
    return time === compareTime;
  }

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
 * round minute up to hour
 * @param {string} time
 * @returns {string} ceil time
 */
export const ceilToHour = time => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  const { hour, minute } = parse(time);

  const newHour = minute > 0 ? hour + 1 : hour;

  return stringify({
    hour: newHour,
    minute: 0,
  });
};

/**
 * round minute floor to hour
 * @param {string} time
 * @returns {string} floor to hour time
 */
export const floorToHour = time => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  const { hour } = parse(time);

  return stringify({
    hour,
    minute: 0,
  });
};

/**
 * round minute to 0 15 30 45 60
 * @param {string} time
 * @returns {string} quarter time
 */
export const ceilToQuarter = time => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  const { hour, minute } = parse(time);

  const quarterMinutes = [0, 15, 30, 45, 60];

  const quarter = quarterMinutes.find(m => m >= minute);

  return stringify({
    hour,
    minute: quarter,
  });
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
 *  * indicates whether is same today
 * @param {Dayjs} Dayjs object
 * @returns {boolean} result
 */
export const isToday = date => {
  invariant(dayjs.isDayjs(date), 'Not Dayjs object');

  return dayjs().isSame(date, 'day');
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

/**
 * format to 12 hour
 * @param {*} time
 * @returns {string}
 */
export const formatTo12hour = (time, withTimePeriod = true) => {
  invariant(isValidTime(time), InvalidTimeErrorMessage);

  const dateTime = setDateTime(time);

  return dateTime.format(`hh:mm${withTimePeriod ? ' A' : ''}`);
};

/**
 * format to time with formatter
 * @param {*} time
 * @param {string} Reference: https://day.js.org/docs/en/display/format#list-of-all-available-formats
 * @returns
 */
export const formatTime = (time, formatter = 'h:mm A') => {
  if (!isValidTime(time)) {
    // eslint-disable-next-line no-console
    console.warn(`The "${time}" is not valid time to format.`);
    return time;
  }

  const dateTime = setDateTime(time);

  return dateTime.format(formatter);
};

/**
 * get locale time format to `HH:MM`
 * @param {string} dateTime (e.g. `2021-11-30T14:58:30+08:00`)
 * @param {number} utcOffset
 * @returns {string} of locale time
 */
export const getLocaleTimeTo24hour = (dateTime, utcOffset) => {
  const dateTimeDayjs = dayjs(dateTime).utcOffset(utcOffset);

  return dateTimeDayjs.format('HH:mm');
};
