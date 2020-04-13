export const getDay = date =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];

export const nth = d => {
  // d => same type of value of new Date().getDate()
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export const getDate = date => {
  const d = date.getDate();
  return `${d}${nth(d)}`;
};

export const getMonth = date =>
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][date.getMonth()];

export const formatNumber = (value, format) => {
  if (!format || typeof format !== 'string') {
    return String(value);
  }

  return (format + value).slice(-format.length);
};

export const getTime = date => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${formatNumber(hours % 12 || 12, '00')}:${formatNumber(minutes, '00')} ${ampm}`;
};

export const getTimeRange = (date1, date2) => `${getTime(date1)} - ${getTime(date2)}`;

export const getDayDateMonth = date => `${getDay(date)}, ${getDate(date)} ${getMonth(date)}`;

export const formatToDeliveryTime = ({ date, hour }) => {
  const workDate = new Date(date.date);
  const workDateFrom = new Date(date.date);
  workDateFrom.setHours(hour.from, 0, 0);
  const workDateTo = new Date(date.date);
  workDateTo.setHours(hour.to, 0, 0);

  const part1 = getDayDateMonth(workDate);
  const part2 = getTimeRange(workDateFrom, workDateTo);

  return `${part1}, ${part2}`;
};
