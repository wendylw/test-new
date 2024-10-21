import {
  toNumericTime,
  toNumericTimeRange,
  toDayDateMonth,
  getDifferenceInMilliseconds,
  getFormatLocaleDateTime,
  getSwitchFormatDate,
  getDateISOString,
} from './datetime-lib';

describe('utils/datetime-lib', () => {
  it('toNumericTime', () => {
    const check = (str, value) => {
      expect(toNumericTime(new Date(str), 'MY')).toBe(value);
    };
    check('2020-01-01T01:02:03+08:00', '01:02 AM');
    check('2020-01-01T13:02:03+08:00', '01:02 PM');
  });

  it('toNumericTimeRange', () => {
    const check = (str1, str2, value) => {
      expect(toNumericTimeRange(new Date(str1), new Date(str2), 'MY')).toBe(value);
    };
    check('2020-01-01T01:02:03+08:00', '2020-01-01T01:04:05+08:00', '01:02 AM - 01:04 AM');
  });

  it('toDayDateMonth', () => {
    const check = (str, value) => {
      expect(toDayDateMonth(new Date(str), 'MY')).toBe(value);
    };
    check('2020-03-29T00:00:00+08:00', 'Sunday, March 29');
    check('2020-04-01T00:00:00+08:00', 'Wednesday, April 1');
  });

  it('getDifferenceInMilliseconds', () => {
    const result = getDifferenceInMilliseconds(
      new Date(2014, 6, 2, 12, 30, 21, 700),
      new Date(2014, 6, 2, 12, 30, 20, 600)
    );
    expect(result).toBe(1100);
  });

  it('getFormatLocaleDateTime', () => {
    const check = ({ dateTime, utcOffset, formatter }, value) => {
      expect(getFormatLocaleDateTime({ dateTime, utcOffset, formatter })).toBe(value);
    };

    check({ dateTime: '2024-06-19T06:23:23.437Z' }, '2024/06/19 14:23:23');
    check({ dateTime: '2024-06-19T06:23:23.437Z', formatter: 'YYYY.MM.DD HH:mm:ss' }, '2024.06.19 14:23:23');
    check({ dateTime: '2024-06-19T06:23:23.437Z', utcOffset: 0 }, '2024/06/19 06:23:23');
    check(
      { dateTime: '2024-06-19T06:23:23.437Z', utcOffset: 0, formatter: 'YYYY.MM.DD HH:mm:ss' },
      '2024.06.19 06:23:23'
    );
  });

  it('getSwitchFormatDate', () => {
    const check = ({ date, originalFormatter, formatter }, value) => {
      expect(getSwitchFormatDate(date, originalFormatter, formatter)).toBe(value);
    };

    check({ date: '2024-06-19', formatter: 'YYYY/MM/DD' }, '2024/06/19');
    check({ date: '19/06/2024', originalFormatter: 'DD/MM/YYYY', formatter: 'YYYY.MM.DD' }, '2024.06.19');
    check({ date: '2024/06/19' }, '2024-06-19');
  });

  it('getDateISOString', () => {
    const check = ({ date }, value) => {
      expect(getDateISOString(date)).toBe(value);
    };

    check({ date: '2024-06-19' }, '2024-06-18T16:00:00.000Z');
    check({ date: '2024/06/19' }, '2024-06-18T16:00:00.000Z');
    check({ date: '06/19/2024' }, '2024-06-18T16:00:00.000Z');
  });
});
