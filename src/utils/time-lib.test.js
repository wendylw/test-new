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
  `('return $expected when $time is added $value $unit', ({ time, value, unit, expected }) => {
    expect(minus(time, { value, unit })).toBe(expected);
  });
});

describe('test getAmountOfMinutes function', () => {
  test.each`
    time       | expected
    ${'16:30'} | ${990}
  `('return $expected minutes when get $time amount of minutes', ({ time, expected }) => {
    expect(getAmountOfMinutes(time)).toBe(expected);
  });
});

describe('test toMinutes function', () => {
  test.each`
    value | unit      | expected
    ${16} | ${'hour'} | ${960}
  `('return $expected minutes when $value $unit to minutes', ({ value, unit, expected }) => {
    expect(toMinutes(value, unit)).toBe(expected);
  });
});

describe('test stringify function', () => {
  test.each`
    param                       | expected
    ${{ hour: 16, minute: 30 }} | ${'16:30'}
  `('return $expected when stringify $param', ({ param, expected }) => {
    expect(stringify(param)).toBe(expected);
  });
});

describe('test parse function', () => {
  test.each`
    time       | expected
    ${'16:40'} | ${{ hour: 16, minute: 40 }}
  `('return $expected when parse $time', ({ time, expected }) => {
    expect(parse(time)).toEqual(expected);
  });
});

describe('test minutesToTime function', () => {
  test.each`
    minutes | expected
    ${0}    | ${'00:00'}
    ${100}  | ${'01:40'}
    ${1000} | ${'16:40'}
  `('return $expected when convert $minutes minutes to time', ({ minutes, expected }) => {
    expect(minutesToTime(minutes)).toBe(expected);
  });
});

describe(`test isValidTime function`, () => {
  test.each`
    time       | expected
    ${'00:00'} | ${true}
  `('return $expected when check $time whether is valid form', ({ time, expected }) => {
    expect(isValidTime(time)).toBe(expected);
  });
});

describe('test isBefore function', () => {
  test.each`
    time       | compareTime | expected
    ${'10:00'} | ${'12:00'}  | ${true}
  `('return $expected when $time is before $compareTime', ({ time, compareTime, expected }) => {
    expect(isBefore(time, compareTime)).toBe(expected);
  });
});

describe('test isAfter function', () => {
  test.each`
    time       | compareTime | expected
    ${'10:00'} | ${'12:00'}  | ${false}
    ${'10:00'} | ${'09:59'}  | ${true}
  `('return $expected when $time is after $compareTime', ({ time, compareTime, expected }) => {
    expect(isAfter(time, compareTime)).toBe(expected);
  });
});

describe('test isSame function', () => {
  test.each`
    time       | compareTime | expected
    ${'10:00'} | ${'12:00'}  | ${false}
    ${'10:00'} | ${'09:59'}  | ${false}
    ${'24:00'} | ${'24:00'}  | ${true}
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
  `('return $expected when $time is same or before $compareTime', ({ time, compareTime, expected }) => {
    expect(isSameOrBefore(time, compareTime)).toBe(expected);
  });
});
