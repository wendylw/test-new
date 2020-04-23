import { toNumericTime, toNumericTimeRange, toDayDateMonth } from './datetime-lib';

describe('utils/datetime-lib', () => {
  it('toNumericTime', () => {
    const check = (str, value) => {
      expect(toNumericTime(new Date(str), 'MY')).toBe(value);
    };
    check('2020-01-01T01:02:03+08:00', '1:02 AM');
    check('2020-01-01T13:02:03+08:00', '1:02 PM');
  });

  it('toNumericTimeRange', () => {
    const check = (str1, str2, value) => {
      expect(toNumericTimeRange(new Date(str1), new Date(str2), 'MY')).toBe(value);
    };
    check('2020-01-01T01:02:03+08:00', '2020-01-01T01:04:05+08:00', '1:02 AM - 0:04 AM');
  });

  it('toDayDateMonth', () => {
    const check = (str, value) => {
      expect(toDayDateMonth(new Date(str), 'MY')).toBe(value);
    };
    check('2020-03-29T00:00:00+08:00', 'Sunday, March 29');
    check('2020-04-01T00:00:00+08:00', 'Wednesday, April 1');
  });
});
