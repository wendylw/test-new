import dayjs from 'dayjs';
import {
  add,
  getAmountOfMinutes,
  minus,
  minutesToTime,
  toMinutes,
  parse,
  stringify,
  isValidTime,
  isBefore,
  isAfter,
  isSame,
  isSameOrBefore,
  isSameOrAfter,
  isBetween,
  isToday,
  setDateTime,
  getTimeFromDayjs,
  ceilToHour,
  ceilToQuarter,
  floorToHour,
  formatTo12hour,
  padZero,
  formatTime,
} from './time-lib';

describe('test add function', () => {
  test.each`
    time       | value   | unit        | expected
    ${'00:00'} | ${'2'}  | ${'hour'}   | ${'02:00'}
    ${'16:30'} | ${'30'} | ${'minute'} | ${'17:00'}
    ${'23:00'} | ${2}    | ${'hour'}   | ${'25:00'}
    ${'23:00'} | ${-2}   | ${'hour'}   | ${'21:00'}
    ${'08:00'} | ${'a'}  | ${'hour'}   | ${'NaN:NaN'}
  `('return $expected when $time is added $value $unit', ({ time, value, unit, expected }) => {
    expect(add(time, { value, unit })).toBe(expected);
  });
});

describe('test minus function', () => {
  test.each`
    time       | value   | unit        | expected
    ${'12:00'} | ${'2'}  | ${'hour'}   | ${'10:00'}
    ${'16:30'} | ${'30'} | ${'minute'} | ${'16:00'}
    ${'23:00'} | ${2}    | ${'hour'}   | ${'21:00'}
    ${'23:00'} | ${-2}   | ${'hour'}   | ${'25:00'}
    ${'00:00'} | ${2}    | ${'hour'}   | ${'-2:00'}
    ${'08:00'} | ${'a'}  | ${'hour'}   | ${'NaN:NaN'}
  `('return $expected when $time is minus $value $unit', ({ time, value, unit, expected }) => {
    expect(minus(time, { value, unit })).toBe(expected);
  });
});

describe('test toMinutes function', () => {
  test.each`
    value  | unit        | expected
    ${16}  | ${'hour'}   | ${960}
    ${15}  | ${'minute'} | ${15}
    ${0}   | ${'hour'}   | ${0}
    ${-10} | ${'hour'}   | ${-600}
    ${-10} | ${'minute'} | ${-10}
    ${'a'} | ${'hour'}   | ${NaN}
  `('return $expected minutes when $value $unit to minutes', ({ value, unit, expected }) => {
    expect(toMinutes(value, unit)).toBe(expected);
  });

  test('throw error when unit of argument is invalid', () => {
    expect(() => {
      toMinutes(10, 'invalid unit');
    }).toThrowError("Invalid argument of 'unit'");
  });
});

describe('test stringify function', () => {
  test.each`
    timeObject                   | expected
    ${{ hour: 16, minute: 30 }}  | ${'16:30'}
    ${{ hour: 0, minute: 0 }}    | ${'00:00'}
    ${{ hour: -10, minute: 0 }}  | ${'-10:00'}
    ${{ hour: -1, minute: 0 }}   | ${'-1:00'}
    ${{ hour: 0, minute: 5 }}    | ${'00:05'}
    ${{ hour: 35, minute: 5 }}   | ${'35:05'}
    ${{ hour: 0, minute: 100 }}  | ${'01:40'}
    ${{ hour: 0, minute: -100 }} | ${'-2:20'}
    ${{ hour: -1, minute: -30 }} | ${'-2:30'}
  `('return $expected when stringify $timeObject', ({ timeObject, expected }) => {
    expect(stringify(timeObject)).toBe(expected);
  });
});

describe('test parse function', () => {
  test.each`
    time        | expected
    ${'00:00'}  | ${{ hour: 0, minute: 0 }}
    ${'24:00'}  | ${{ hour: 24, minute: 0 }}
    ${'16:40'}  | ${{ hour: 16, minute: 40 }}
    ${'-16:40'} | ${{ hour: -16, minute: 40 }}
  `('return $expected when parse $time', ({ time, expected }) => {
    expect(parse(time)).toEqual(expected);
  });
});

describe('test minutesToTime function', () => {
  test.each`
    minutes  | expected
    ${0}     | ${'00:00'}
    ${100}   | ${'01:40'}
    ${1000}  | ${'16:40'}
    ${-1000} | ${'-17:20'}
    ${-30}   | ${'-1:30'}
  `('return $expected when convert $minutes minutes to time', ({ minutes, expected }) => {
    expect(minutesToTime(minutes)).toBe(expected);
  });
});

describe('test isBefore function', () => {
  test.each`
    time       | compareTime | expected
    ${'10:00'} | ${'12:00'}  | ${true}
    ${'-1:00'} | ${'00:00'}  | ${true}
    ${'02:00'} | ${'01:00'}  | ${false}
  `('return $expected when $time is before $compareTime', ({ time, compareTime, expected }) => {
    expect(isBefore(time, compareTime)).toBe(expected);
  });
});

describe('test isAfter function', () => {
  test.each`
    time       | compareTime | expected
    ${'10:00'} | ${'12:00'}  | ${false}
    ${'10:00'} | ${'09:59'}  | ${true}
    ${'00:00'} | ${'-1:59'}  | ${true}
  `('return $expected when $time is after $compareTime', ({ time, compareTime, expected }) => {
    expect(isAfter(time, compareTime)).toBe(expected);
  });
});

describe('test isSame function', () => {
  test.each`
    time       | compareTime | expected
    ${'00:00'} | ${'00:00'}  | ${true}
    ${'-0:00'} | ${'00:00'}  | ${true}
    ${'24:00'} | ${'24:00'}  | ${true}
    ${'10:00'} | ${'12:00'}  | ${false}
    ${'10:00'} | ${'09:59'}  | ${false}
    ${'-1:00'} | ${'1:00'}   | ${false}
    ${'now'}   | ${'now'}    | ${true}
  `('return $expected when $time is same $compareTime', ({ time, compareTime, expected }) => {
    expect(isSame(time, compareTime)).toBe(expected);
  });
});

describe('test isSameOrBefore function', () => {
  test.each`
    time       | compareTime | expected
    ${'10:00'} | ${'12:00'}  | ${true}
    ${'10:00'} | ${'10:00'}  | ${true}
    ${'15:00'} | ${'10:00'}  | ${false}
    ${'00:00'} | ${'00:00'}  | ${true}
  `('return $expected when $time is same or before $compareTime', ({ time, compareTime, expected }) => {
    expect(isSameOrBefore(time, compareTime)).toBe(expected);
  });
});

describe('test isSameOrAfter function', () => {
  test.each`
    time       | compareTime | expected
    ${'10:00'} | ${'12:00'}  | ${false}
    ${'10:00'} | ${'10:00'}  | ${true}
    ${'15:00'} | ${'10:00'}  | ${true}
    ${'00:00'} | ${'00:00'}  | ${true}
  `('return $expected when $time is same or after $compareTime', ({ time, compareTime, expected }) => {
    expect(isSameOrAfter(time, compareTime)).toBe(expected);
  });
});

describe('test isBetween function', () => {
  test.each`
    time       | compareTimes                              | inclusivity  | expected
    ${'13:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${undefined} | ${true}
    ${'12:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${undefined} | ${false}
    ${'14:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${undefined} | ${false}
    ${'11:59'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${'()'}      | ${false}
    ${'12:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${'[)'}      | ${true}
    ${'14:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${'[)'}      | ${false}
    ${'12:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${'(]'}      | ${false}
    ${'14:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${'(]'}      | ${true}
    ${'12:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${'[]'}      | ${true}
    ${'14:00'} | ${{ minTime: '12:00', maxTime: '14:00' }} | ${'[]'}      | ${true}
  `(
    'return $expected when $time is isBetween $compareTimes by $inclusivity',
    ({ time, compareTimes, inclusivity, expected }) => {
      expect(isBetween(time, compareTimes, inclusivity)).toBe(expected);
    }
  );

  test('throw error when inclusivity of argument is invalid', () => {
    expect(() => {
      isBetween('00:00', { minTime: '01:00', maxTime: '02:00' }, 'invalid inclusivity');
    }).toThrowError("Invalid argument of 'inclusivity'");
  });
});

describe('test isToday function', () => {
  const oneDayMillineSecond = 24 * 60 * 60 * 1000;
  const today = new Date();
  const todayIOSString = today.toISOString();
  const yesterdayIOSString = new Date(today.getTime() - oneDayMillineSecond).toISOString();
  const tomorrowIOSString = new Date(today.getTime() + oneDayMillineSecond).toISOString();

  test.each`
    date                  | expected
    ${todayIOSString}     | ${true}
    ${yesterdayIOSString} | ${false}
    ${tomorrowIOSString}  | ${false}
  `('return $expected when $date is today or not', ({ date, expected }) => {
    expect(isToday(dayjs(date))).toBe(expected);
  });
});

describe('test getAmountOfMinutes function', () => {
  test.each`
    time       | expected
    ${'13:00'} | ${780}
    ${'25:00'} | ${1500}
    ${'13:59'} | ${839}
    ${'16:30'} | ${990}
    ${'00:00'} | ${0}
    ${'00:01'} | ${1}
    ${'-1:00'} | ${-60}
    ${'-1:30'} | ${-30}
  `('return $expected minutes when get $time amount of minutes', ({ time, expected }) => {
    expect(getAmountOfMinutes(time)).toBe(expected);
  });
});

describe('test isValidTime function', () => {
  test.each`
    time        | expected
    ${'00:00'}  | ${true}
    ${'00:60'}  | ${false}
    ${'00:59'}  | ${true}
    ${'12:30'}  | ${true}
    ${'2:55'}   | ${true}
    ${'02:01'}  | ${true}
    ${'02:001'} | ${false}
    ${'-2:00'}  | ${true}
    ${'-02:00'} | ${true}
    ${'-09:30'} | ${true}
    ${'09:-30'} | ${false}
    ${'09'}     | ${false}
    ${':09'}    | ${false}
    ${':'}      | ${false}
    ${''}       | ${false}
  `('return $expected when check $time whether is valid form', ({ time, expected }) => {
    expect(isValidTime(time)).toBe(expected);
  });
});

describe('test setDateTime function', () => {
  test.each`
    time        | date                           | expected
    ${'00:00'}  | ${'2020-04-02T08:02:17+08:00'} | ${'2020-04-02T00:00:00+08:00'}
    ${'13:35'}  | ${'2020-04-02T08:02:17+08:00'} | ${'2020-04-02T13:35:00+08:00'}
    ${'25:15'}  | ${'2020-04-02T08:02:17+08:00'} | ${'2020-04-03T01:15:00+08:00'}
    ${'-2:00'}  | ${'2020-04-02T08:02:17+08:00'} | ${'2020-04-01T22:00:00+08:00'}
    ${'-24:30'} | ${'2020-04-02T08:02:17+08:00'} | ${'2020-04-01T00:30:00+08:00'}
  `('return $expected when set $date of time to $time', ({ time, date, expected }) => {
    expect(setDateTime(time, dayjs(date)).format()).toBe(expected);
  });
});

describe('test getTimeFromDayjs function', () => {
  test.each`
    date                           | expected
    ${'2020-04-02T08:02:17+08:00'} | ${'08:02'}
    ${'2020-04-02T20:02:17+08:00'} | ${'20:02'}
    ${'2020-04-02T00:00:17+08:00'} | ${'00:00'}
    ${'2020-04-02T24:00:00+08:00'} | ${'00:00'}
  `('return $expected when get time from $date', ({ date, expected }) => {
    expect(getTimeFromDayjs(dayjs(date))).toBe(expected);
  });
});

describe('test ceilToHour function', () => {
  test.each`
    time       | expected
    ${'12:00'} | ${'12:00'}
    ${'12:01'} | ${'13:00'}
    ${'00:00'} | ${'00:00'}
    ${'00:10'} | ${'01:00'}
    ${'-1:10'} | ${'00:00'}
    ${'-2:10'} | ${'-1:00'}
  `(`return $expected when ceil $time`, ({ time, expected }) => {
    expect(ceilToHour(time)).toBe(expected);
  });
});

describe('test floorToHour function', () => {
  test.each`
    time       | expected
    ${'12:00'} | ${'12:00'}
    ${'12:11'} | ${'12:00'}
    ${'00:00'} | ${'00:00'}
    ${'00:10'} | ${'00:00'}
    ${'00:50'} | ${'00:00'}
    ${'-1:10'} | ${'-1:00'}
    ${'-2:10'} | ${'-2:00'}
  `(`return $expected when floor $time to hour`, ({ time, expected }) => {
    expect(floorToHour(time)).toBe(expected);
  });
});

describe('test ceilToQuarter function', () => {
  test.each`
    time       | expected
    ${'12:00'} | ${'12:00'}
    ${'12:01'} | ${'12:15'}
    ${'00:25'} | ${'00:30'}
    ${'00:40'} | ${'00:45'}
    ${'01:50'} | ${'02:00'}
    ${'-1:10'} | ${'-1:15'}
    ${'-2:50'} | ${'-1:00'}
  `(`return $expected when quarter $time`, ({ time, expected }) => {
    expect(ceilToQuarter(time)).toBe(expected);
  });
});

describe('test formatTo12hour function', () => {
  test.each`
    time       | expected
    ${'12:00'} | ${'12:00 PM'}
    ${'12:01'} | ${'12:01 PM'}
    ${'00:25'} | ${'12:25 AM'}
    ${'00:40'} | ${'12:40 AM'}
    ${'01:50'} | ${'01:50 AM'}
    ${'-1:10'} | ${'11:10 PM'}
    ${'-2:50'} | ${'10:50 PM'}
  `(`return $expected when format $time to 12 hour`, ({ time, expected }) => {
    expect(formatTo12hour(time)).toBe(expected);
  });
});

describe('test padZero function', () => {
  test.each`
    value | expected
    ${0}  | ${'00'}
    ${12} | ${'12'}
    ${-1} | ${'-1'}
  `(`return $expected when call padZero with $value`, ({ value, expected }) => {
    expect(padZero(value)).toBe(expected);
  });
});

describe('test formatTime function', () => {
  test.each`
    time       | format       | expected
    ${'12:00'} | ${undefined} | ${'12:00 PM'}
    ${'01:50'} | ${undefined} | ${'1:50 AM'}
    ${'12:01'} | ${'hh:mm A'} | ${'12:01 PM'}
    ${'00:25'} | ${'hh:mm A'} | ${'12:25 AM'}
    ${'00:40'} | ${'hh:mm'}   | ${'12:40'}
    ${':40'}   | ${'hh:mm'}   | ${':40'}
  `(`return $expected when call formatTime with $time and $format`, ({ time, format, expected }) => {
    expect(formatTime(time, format)).toBe(expected);
  });
});
