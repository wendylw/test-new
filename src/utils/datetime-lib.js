/* eslint-disable no-console */
import i18next from 'i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import invariant from 'invariant';
import CONSTANTS from './constants';
import * as timeLib from './time-lib';
import logger from './monitoring/logger';

dayjs.extend(utc);

export const standardizeLocale = (countryCode = 'MY') => {
  const standardizedLocaleMap = {
    MY: 'EN',
    TH: 'EN',
    PH: 'EN',
    EN: 'EN',
  };
  const country = countryCode || 'MY';
  return standardizedLocaleMap[country.toUpperCase()] || 'EN';
};

// Returned time format is Dec 7, 2020
export const formatTimeToDateString = (countryCode, time) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };

  return new Intl.DateTimeFormat(standardizeLocale(countryCode), options).format(new Date(time));
};

export const getDateTimeFormatter = (countryCode, options) =>
  new Intl.DateTimeFormat(standardizeLocale(countryCode), options);

export const padZero = num => {
  const str = num.toString();
  if (str.length === 1) {
    return `0${str}`;
  }
  return str;
};

export const isValidDate = date => {
  if (date instanceof Date) {
    return date.toString() !== 'Invalid Date';
  }

  return false;
};

// An imperfect fallback in case Intl.DateTimeFormat doesn't work
// Will display numeric date and time ignoring countryCode for now.
const toLocaleStringFallback = (date, countryCode, options) => {
  const weekdayString = options.weekday ? CONSTANTS.WEEK_DAYS_I18N_KEYS[date.getDay()] : '';
  const dateArray = [];
  const timeArray = [];
  let dateString = '';
  let timeString = '';
  const dateOptions = {
    year: !!options.year,
    month: !!options.month,
    day: !!options.day,
  };
  const timeOptions = {
    hour: !!options.hour,
    minute: !!options.minute,
    second: !!options.second,
  };
  if (dateOptions.year || dateOptions.month || dateOptions.day) {
    // month must be displayed if date is displayed.
    if (dateOptions.day) {
      dateOptions.month = true;
    }
    // year must be displayed if month is displayed alone.
    if (dateOptions.month && !dateOptions.day) {
      dateOptions.year = true;
    }
    if (dateOptions.month) {
      dateArray.push(padZero((date.getMonth() + 1).toString()));
    }
    if (dateOptions.day) {
      dateArray.push(padZero(date.getDate().toString()));
    }
    if (dateOptions.year) {
      dateArray.push(date.getFullYear().toString());
    }
    dateString = dateArray.join('/');
  }
  if (timeOptions.hour || timeOptions.minute || timeOptions.second) {
    // always display hour
    timeOptions.hour = true;
    if (timeOptions.second) {
      timeOptions.minute = true;
    }
    if (timeOptions.hour) {
      timeArray.push(padZero(date.getHours().toString()));
    }
    // always display minute, but if user doesn't require minute, display 00
    if (timeOptions.minute) {
      timeArray.push(padZero(date.getMinutes().toString()));
    } else {
      timeArray.push('00');
    }
    if (timeOptions.second) {
      timeArray.push(padZero(date.getSeconds().toString()));
    }
    timeString = timeArray.join(':');
  }

  return [weekdayString, dateString, timeString].filter(str => !!str).join(' ');
};

// for options, refer to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat
// for locale, refer to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
export const toLocaleString = (date, countryCode, options) => {
  const dateObj = new Date(date);
  if (!isValidDate(dateObj)) {
    console.warn('Invalid date object');
    logger.warn('Utils_DateTimeLib_ToLocaleStringFailedByInvalidDateObject');
    return '';
  }
  let formatter;
  try {
    formatter = getDateTimeFormatter(countryCode, options);
  } catch (error) {
    console.error('Fail to create instance of Intl.DateTimeFormat', error?.message || '');

    return toLocaleStringFallback(date, countryCode, options);
  }
  if (formatter.format) {
    return formatter.format(dateObj);
  }
  if (formatter.formatToParts) {
    return formatter
      .formatToParts(dateObj)
      .map(part => part.value)
      .join('');
  }
  console.error('Intl.DateTimeFormat does not support format or formatToParts');
  return toLocaleStringFallback(date, countryCode, options);
};

// only alias of toLocaleString
export const toLocaleDateString = (date, countryCode, options) => toLocaleString(date, countryCode, options);

// only alias of toLocaleString
export const toLocaleTimeString = (date, countryCode, options) => toLocaleString(date, countryCode, options);

export const toNumericTime = (date, locale = 'MY') =>
  toLocaleTimeString(date, locale, { hour: '2-digit', minute: '2-digit' });

export const toNumericTimeRange = (date1, date2, locale = 'MY') =>
  `${toNumericTime(date1, locale)} - ${toNumericTime(date2, locale)}`;

export const toDayDateMonth = (date, locale = 'MY') =>
  toLocaleDateString(date, locale, { weekday: 'long', day: 'numeric', month: 'long' });

// formate: 2020-4-23 (YYYY-MM-DD)
export const toISODateString = date => {
  const dateObj = new Date(date);
  if (!isValidDate(dateObj)) {
    console.warn('Invalid date object');
    logger.warn('Utils_DateTimeLib_ToISODateStringFailedByInvalidDateObject');
    return '';
  }
  return `${dateObj.getFullYear()}-${padZero(dateObj.getMonth() + 1)}-${padZero(dateObj.getDate())}`;
};

export const formatToDeliveryTime = ({ date, hour, businessUTCOffset = 480, separator = ',' }) => {
  const { from, to } = hour || {};

  if (from === CONSTANTS.TIME_SLOT_NOW) return i18next.t('DeliverNow', { separator });

  const dateDayjs = dayjs(date.date).utcOffset(businessUTCOffset);
  const currentDayjs = dayjs().utcOffset(businessUTCOffset);
  const fromDayjs = from ? timeLib.setDateTime(from, dateDayjs) : null;
  const toDayjs = to ? timeLib.setDateTime(to, dateDayjs) : null;

  if (!fromDayjs) {
    return null;
  }

  const isToday = fromDayjs.isSame(currentDayjs, 'day');
  const isTomorrow = fromDayjs.isSame(currentDayjs.add(1, 'day'), 'day');
  const dateString = isToday
    ? i18next.t('Today')
    : isTomorrow
    ? i18next.t('Tomorrow')
    : fromDayjs.format('dddd, MMMM DD');
  const fromTimeString = fromDayjs.format('hh:mm A');
  const toTimeString = toDayjs ? toDayjs.format('hh:mm A') : null;
  const timeString = toTimeString ? `${fromTimeString} - ${toTimeString}` : fromTimeString;

  return `${dateString}${separator} ${timeString}`;
};

export const formatPickupTime = ({ date, businessUTCOffset = 480, separator = ', ' }) => {
  const dateDayjs = dayjs(date).utcOffset(businessUTCOffset);
  const currentDayjs = dayjs().utcOffset(businessUTCOffset);
  const isToday = currentDayjs.isSame(dateDayjs, 'day');
  const timeString = dateDayjs.format('hh:mm A');

  if (isToday) {
    return `${i18next.t('Today')}${separator}${timeString}`;
  }

  const dateString = dateDayjs.format('dddd, MMMM DD');

  return `${dateString}${separator}${timeString}`;
};

export const addTime = (date = new Date(), timeToAdd, unit) => {
  const baseTime = new Date(date) || new Date();
  const tempTime = new Date(baseTime);

  switch (unit) {
    case 'h': {
      const newTime = tempTime.setHours(baseTime.getHours() + timeToAdd);
      return new Date(newTime).toISOString();
    }
    case 'm': {
      const newTime = tempTime.setMinutes(baseTime.getMinutes() + timeToAdd);
      return new Date(newTime).toISOString();
    }
    case 's': {
      const newTime = tempTime.setSeconds(baseTime.getSeconds() + timeToAdd);
      return new Date(newTime).toISOString();
    }
    default:
      return new Date(baseTime()).toISOString();
  }
};

export const isSameTime = (time1, time2, unitToCheck = []) => {
  const timeDate1 = new Date(time1);
  const timeDate2 = new Date(time2);

  if (unitToCheck.includes('y')) {
    if (timeDate1.getFullYear() !== timeDate2.getFullYear()) return false;
  }

  // M for month, and m for minute
  if (unitToCheck.includes('M')) {
    if (timeDate1.getMonth() !== timeDate2.getMonth()) return false;
  }

  if (unitToCheck.includes('h')) {
    if (timeDate1.getHours() !== timeDate2.getHours()) return false;
  }

  if (unitToCheck.includes('m')) {
    if (timeDate1.getMinutes() !== timeDate2.getMinutes()) return false;
  }

  return true;
};

export const getDifferenceInMilliseconds = (dateLeft, dateRight) => {
  invariant(isValidDate(dateLeft) && isValidDate(dateRight), 'invalid date object');

  return dateLeft.getTime() - dateRight.getTime();
};

export const getIsAfterDateTime = (date, dateCompare, unit = 'millisecond') => {
  invariant(isValidDate(date) && isValidDate(dateCompare), 'invalid date object');

  return dayjs(date).isAfter(dateCompare, unit);
};
