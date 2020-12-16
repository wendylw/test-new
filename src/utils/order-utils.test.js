import { getBusinessCurrentTime, isInBreakTime, isInVacations, isInValidDays, isInValidTime } from './order-utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

describe('test checkStoreIsOpened function', () => {
  test.todo('test checkStoreIsOpened function');
});

describe('test isAvailableOrderTime function', () => {
  test.todo('Do we actually need test isAvailableOrderTime function?');
});

describe('test isInValidDays function', () => {
  const fridayDate = '2020-12-04T00:00:00+08:00';
  const sundayDate = '2020-11-29T00:00:00+08:00';
  const saturdayDate = '2020-12-26T00:00:00+08:00';

  test.each`
    date            | validDays             | expected
    ${fridayDate}   | ${[1, 2, 3]}          | ${false}
    ${fridayDate}   | ${[6]}                | ${true}
    ${sundayDate}   | ${[3, 4, 5]}          | ${false}
    ${sundayDate}   | ${[1]}                | ${true}
    ${saturdayDate} | ${[7]}                | ${true}
    ${saturdayDate} | ${[1, 2, 3, 4, 5, 6]} | ${false}
    ${saturdayDate} | ${[]}                 | ${false}
    ${saturdayDate} | ${null}               | ${false}
  `('return $expected, $date whether in $validDays', ({ date, validDays, expected }) => {
    expect(isInValidDays(dayjs(date), validDays)).toBe(expected);
  });
});

describe('test isInValidTime function', () => {
  test.each`
    date                           | validTimeFrom    | validTimeTo | expected
    ${'2020-12-04T10:53:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'2020-12-04T10:00:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'2020-12-04T18:00:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${false}
    ${'2020-12-04T18:12:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${false}
    ${'2020-12-04T18:12:00+08:00'} | ${'invalidTime'} | ${'18:00'}  | ${false}
  `(
    'return $expected, $date whether in $validTimeFrom - $validTimeTo',
    ({ date, validTimeFrom, validTimeTo, expected }) => {
      expect(isInValidTime(dayjs(date), { validTimeFrom, validTimeTo })).toBe(expected);
    }
  );
});

describe('test isInBreakTime function', () => {
  test.each`
    date                           | breakTimeFrom    | breakTimeTo | expected
    ${'2020-12-04T10:53:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'2020-12-04T10:00:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'2020-12-04T18:00:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${false}
    ${'2020-12-04T18:12:00+08:00'} | ${'10:00'}       | ${'18:00'}  | ${false}
    ${'2020-12-04T18:12:00+08:00'} | ${'invalidTime'} | ${'18:00'}  | ${false}
  `(
    'return $expected, $date whether in $breakTimeFrom - $breakTimeTo',
    ({ date, breakTimeFrom, breakTimeTo, expected }) => {
      expect(isInBreakTime(dayjs(date), { breakTimeFrom, breakTimeTo })).toBe(expected);
    }
  );
});

describe('test isInVacations function', () => {
  test.each`
    date                           | vacations                                             | expected
    ${'2020-12-04T10:53:00+08:00'} | ${['2020/12/01-2020/12/02']}                          | ${false}
    ${'2020-12-04T10:53:00+08:00'} | ${['2020/12/04-2020/12/08']}                          | ${true}
    ${'2020-12-04T10:53:00+08:00'} | ${['2020/12/01-2020/12/04']}                          | ${true}
    ${'2020-12-04T10:53:00+08:00'} | ${['2020/12/10-2020/12/11', '2020/12/20-2020/12/25']} | ${false}
    ${'2020-12-04T10:53:00+08:00'} | ${[]}                                                 | ${false}
    ${'2020-12-04T10:53:00+08:00'} | ${null}                                               | ${false}
  `('return $expected, $date whether in $vacations', ({ date, vacations, expected }) => {
    const vacationsArray = vacations
      ? vacations.map(vacation => {
          const split = vacation.split('-');
          return {
            vacationTimeFrom: split[0],
            vacationTimeTo: split[1],
          };
        })
      : null;

    expect(isInVacations(dayjs(date), vacationsArray)).toBe(expected);
  });
});

describe('test getBusinessCurrentTime function', () => {
  const currentTime = dayjs();

  test.each`
    utcOffset | expected
    ${480}    | ${currentTime.utcOffset(480)}
    ${0}      | ${currentTime.utcOffset(0)}
    ${420}    | ${currentTime.utcOffset(420)}
    ${-480}   | ${currentTime.utcOffset(-480)}
  `('return $expected when set current time utcOffset to $utcOffset', ({ utcOffset, expected }) => {
    expect(getBusinessCurrentTime(utcOffset).isSame(expected, 'minute')).toBeTruthy();
  });
});
