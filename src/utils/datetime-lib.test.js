import { getDate, getDay, getMonth, getTime, nth, formatNumber, getTimeRange, getDayDateMonth } from './datetime-lib';

describe('utils/datetime-lib', () => {
  it('getDay', () => {
    const check = (str, day) => {
      expect(getDay(new Date(str))).toBe(day);
    };
    check('2020-03-29T00:00:00+08:00', 'Sunday');
    check('2020-03-29T01:00:00+08:00', 'Sunday');
    check('2020-03-29T21:00:00+08:00', 'Sunday');
    check('2020-03-30T21:00:00+08:00', 'Monday');
    check('2020-03-31T21:00:00+08:00', 'Tuesday');
    check('2020-04-01T21:00:00+08:00', 'Wednesday');
    check('2020-04-02T21:00:00+08:00', 'Thursday');
    check('2020-04-03T21:00:00+08:00', 'Friday');
    check('2020-04-04T21:00:00+08:00', 'Saturday');
    check('2020-04-05T21:00:00+08:00', 'Sunday');
  });

  it('nth', () => {
    const check = (str, value) => {
      expect(nth(new Date(str).getDate())).toBe(value);
    };
    check('2020-03-29T01:00:00+08:00', 'th');
    check('2020-03-30T01:00:00+08:00', 'th');
    check('2020-04-01T01:00:00+08:00', 'st');
    check('2020-04-02T01:00:00+08:00', 'nd');
    check('2020-04-03T01:00:00+08:00', 'rd');
    check('2020-04-04T01:00:00+08:00', 'th');
  });

  it('getDate', () => {
    const check = (str, value) => {
      expect(getDate(new Date(str))).toBe(value);
    };
    check('2020-03-29T01:00:00+08:00', '29th');
    check('2020-03-30T01:00:00+08:00', '30th');
    check('2020-04-01T01:00:00+08:00', '1st');
    check('2020-04-02T01:00:00+08:00', '2nd');
    check('2020-04-03T01:00:00+08:00', '3rd');
    check('2020-04-04T01:00:00+08:00', '4th');
  });

  it('getMonth', () => {
    const check = (str, value) => {
      expect(getMonth(new Date(str))).toBe(value);
    };
    check('2020-01-01T01:00:00+08:00', 'January');
    check('2020-02-01T01:00:00+08:00', 'February');
    check('2020-03-01T01:00:00+08:00', 'March');
    check('2020-04-01T01:00:00+08:00', 'April');
    check('2020-05-01T01:00:00+08:00', 'May');
    check('2020-06-01T01:00:00+08:00', 'June');
    check('2020-07-01T01:00:00+08:00', 'July');
    check('2020-08-01T01:00:00+08:00', 'August');
    check('2020-09-01T01:00:00+08:00', 'September');
    check('2020-10-01T01:00:00+08:00', 'October');
    check('2020-11-01T01:00:00+08:00', 'November');
    check('2020-12-01T01:00:00+08:00', 'December');
  });

  it('formatNumber', () => {
    expect(formatNumber(1, '000')).toBe('001');
    expect(formatNumber(12, '000')).toBe('012');
    expect(formatNumber(123, '000')).toBe('123');

    // special case
    expect(formatNumber(1234, '000')).toBe('234');
  });

  it('getTime', () => {
    const check = (str, value) => {
      expect(getTime(new Date(str))).toBe(value);
    };
    check('2020-01-01T01:02:03+08:00', '01:02 AM');
    check('2020-01-01T13:02:03+08:00', '01:02 PM');
  });

  it('getTimeRange', () => {
    const check = (str1, str2, value) => {
      expect(getTimeRange(new Date(str1), new Date(str2))).toBe(value);
    };
    check('2020-01-01T01:02:03+08:00', '2020-01-01T01:04:05+08:00', '01:02 AM - 01:04 AM');
  });

  it('getDayDateMonth', () => {
    const check = (str, value) => {
      expect(getDayDateMonth(new Date(str))).toBe(value);
    };
    check('2020-03-29T00:00:00+08:00', 'Sunday, 29th March');
    check('2020-04-01T00:00:00+08:00', 'Wednesday, 1st April');
  });
});
