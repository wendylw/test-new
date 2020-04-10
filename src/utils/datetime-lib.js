export const standardizeLocale = countryCode => {
  const standardizedLocaleMap = {
    MY: 'EN',
    TH: 'TH',
    PH: 'EN',
    EN: 'EN',
  };
  return standardizedLocaleMap[countryCode.toUpperCase()] || 'EN';
};

// for options, refer to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat
// for locale, refer to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
export const toLocaleString = (date, countryCode, options) => {
  const locale = countryCode ? standardizeLocale(countryCode) : undefined;
  return date.toLocaleString(locale, options);
};

export const toLocaleDateString = (date, countryCode, options) => {
  const locale = countryCode ? standardizeLocale(countryCode) : undefined;
  return date.toLocaleDateString(locale, options);
};

export const toLocaleTimeString = (date, countryCode, options) => {
  const locale = countryCode ? standardizeLocale(countryCode) : undefined;
  return date.toLocaleTimeString(locale, options);
};

export const toNumericTime = (date, locale = 'MY') => {
  return toLocaleTimeString(date, locale, { hour: 'numeric', minute: '2-digit' });
};

export const toNumericTimeRange = (date1, date2, locale = 'MY') =>
  `${toNumericTime(date1, locale)} - ${toNumericTime(date2, locale)}`;

export const toDayDateMonth = (date, locale = 'MY') =>
  date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });

export const formatToDeliveryTime = ({ date, hour, locale = 'MY' }) => {
  const workDate = new Date(date.date);
  const workDateFrom = new Date(date.date);
  workDateFrom.setHours(hour.from);
  const workDateTo = new Date(date.date);
  workDateTo.setHours(hour.to);

  const part1 = toDayDateMonth(workDate, locale);
  const part2 = toNumericTimeRange(workDateFrom, workDateTo, locale);

  return `${part1}, ${part2}`;
};
