import { check } from 'yargs';
import { toNumericTime, toNumericTimeRange, toDayDateMonth, getDifferenceInMilliseconds } from './datetime-lib';

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
});
