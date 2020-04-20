import CONSTANTS from './constants';
import i18next from 'i18next';
export const standardizeLocale = (countryCode = 'MY') => {
  const standardizedLocaleMap = {
    MY: 'EN',
    TH: 'TH',
    PH: 'EN',
    EN: 'EN',
  };
  return standardizedLocaleMap[countryCode.toUpperCase()] || 'EN';
};

export const getDateTimeFormatter = (countryCode, options) => {
  return new Intl.DateTimeFormat(standardizeLocale(countryCode), options);
};

export const padZero = num => {
  const str = num.toString();
  if (str.length === 1) {
    return `0${str}`;
  }
  return str;
};
// An imperfect fallback in case Intl.DateTimeFormat doesn't work
// Will display numeric date and time ignoring countryCode for now.
const toLocaleStringFallback = (date, countryCode, options) => {
  let weekdayString = options.weekday ? CONSTANTS.WEEK_DAYS_I18N_KEYS[date.getDay()] : '';
  let dateArray = [];
  let timeArray = [];
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
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date object');
    return '';
  }
  let formatter;
  try {
    formatter = getDateTimeFormatter(countryCode, options);
  } catch (e) {
    console.error('Fail to create instance of Intl.DateTimeFormat', e);
    return toLocaleStringFallback(date, countryCode, options);
  }
  if (formatter.format) {
    return formatter.format(dateObj);
  } else if (formatter.formatToParts) {
    return formatter
      .formatToParts(dateObj)
      .map(part => part.value)
      .join('');
  } else {
    console.error('Intl.DateTimeFormat does not support format or formatToParts');
    return toLocaleStringFallback(date, countryCode, options);
  }
};

// only alias of toLocaleString
export const toLocaleDateString = (date, countryCode, options) => {
  return toLocaleString(date, countryCode, options);
};

// only alias of toLocaleString
export const toLocaleTimeString = (date, countryCode, options) => {
  return toLocaleString(date, countryCode, options);
};

export const toNumericTime = (date, locale = 'MY') => {
  return toLocaleTimeString(date, locale, { hour: '2-digit', minute: '2-digit' });
};

export const toNumericTimeRange = (date1, date2, locale = 'MY') =>
  `${toNumericTime(date1, locale)} - ${toNumericTime(date2, locale)}`;

export const toDayDateMonth = (date, locale = 'MY') =>
  toLocaleDateString(date, locale, { weekday: 'long', day: 'numeric', month: 'long' });

export const formatToDeliveryTime = ({ date, hour, locale = 'MY' }) => {
  const { from, to } = hour || {};

  if (from === CONSTANTS.PREORDER_IMMEDIATE_TAG.from) return i18next.t('DeliverNow');

  const hourFrom = (from || '').split(':')[0];
  const minuteFrom = (from || '').split(':')[1];
  const workDate = new Date(date.date);
  const workDateFrom = new Date(date.date);
  workDateFrom.setHours(hourFrom, minuteFrom, 0, 0);
  let part1;

  if (workDate.getDate() === new Date().getDate()) {
    part1 = i18next.t('Today');
  } else {
    part1 = toDayDateMonth(workDate, locale);
  }

  let part2 = toNumericTime(workDateFrom, locale);

  if (to) {
    const hourTo = (to || '').split(':')[0];
    const minuteTo = (to || '').split(':')[1];
    const workDateTo = new Date(date.date);
    workDateTo.setHours(hourTo, minuteTo, 0, 0);
    part2 = toNumericTimeRange(workDateFrom, workDateTo, locale);
  }

  return `${part1}, ${part2}`;
};

export const formatPickupAddress = ({ date, locale }) => {
  const orderTime = new Date(date);
  let part1;

  if (orderTime.getDate() === new Date().getDate()) {
    part1 = i18next.t('Today');
  } else {
    part1 = toDayDateMonth(orderTime, locale);
  }

  const part2 = toNumericTime(orderTime, locale);

  return `${part1}, ${part2}`;
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
