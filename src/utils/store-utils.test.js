import { getBusinessDateTime, isInBreakTime, isInVacations, isInValidDays, isInValidTime } from './store-utils';
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
  const fridayDate = 5;
  const sundayDate = 0;
  const saturdayDate = 6;

  test.each`
    dayOfWeek       | validDays             | expected
    ${fridayDate}   | ${[1, 2, 3]}          | ${false}
    ${fridayDate}   | ${[6]}                | ${true}
    ${sundayDate}   | ${[3, 4, 5]}          | ${false}
    ${sundayDate}   | ${[1]}                | ${true}
    ${saturdayDate} | ${[7]}                | ${true}
    ${saturdayDate} | ${[1, 2, 3, 4, 5, 6]} | ${false}
    ${saturdayDate} | ${[]}                 | ${false}
    ${saturdayDate} | ${null}               | ${false}
  `('return $expected, $dayOfWeek whether in $validDays', ({ dayOfWeek, validDays, expected }) => {
    expect(isInValidDays(dayOfWeek, validDays)).toBe(expected);
  });
});

describe('test isInValidTime function', () => {
  test.each`
    time       | validTimeFrom    | validTimeTo | expected
    ${'10:53'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'10:00'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'18:00'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'18:12'} | ${'10:00'}       | ${'18:00'}  | ${false}
    ${'18:12'} | ${'invalidTime'} | ${'18:00'}  | ${false}
  `(
    'return $expected, $time whether in $validTimeFrom - $validTimeTo',
    ({ time, validTimeFrom, validTimeTo, expected }) => {
      expect(isInValidTime(time, { validTimeFrom, validTimeTo })).toBe(expected);
    }
  );
});

describe('test isInBreakTime function', () => {
  test.each`
    time       | breakTimeFrom    | breakTimeTo | expected
    ${'10:53'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'10:00'} | ${'10:00'}       | ${'18:00'}  | ${true}
    ${'18:00'} | ${'10:00'}       | ${'18:00'}  | ${false}
    ${'18:12'} | ${'10:00'}       | ${'18:00'}  | ${false}
    ${'18:12'} | ${'invalidTime'} | ${'18:00'}  | ${false}
  `(
    'return $expected, the $time whether in $breakTimeFrom - $breakTimeTo',
    ({ time, breakTimeFrom, breakTimeTo, expected }) => {
      expect(isInBreakTime(time, { breakTimeFrom, breakTimeTo })).toBe(expected);
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

describe('test getBusinessDateTime function', () => {
  const currentTime = dayjs();

  test.skip.each`
    utcOffset | date                                    | expected
    ${480}    | ${undefined}                            | ${currentTime.utcOffset(480).format()}
    ${480}    | ${new Date('2020-12-15T16:23:12.000Z')} | ${'2020-12-16T00:23:12+08:00'}
    ${420}    | ${new Date('2020-12-15T10:55:55.000Z')} | ${'2020-12-15T17:55:55+07:00'}
    ${0}      | ${new Date('2020-12-15T16:00:00.000Z')} | ${'2020-12-15T16:00:00Z'}
  `('return $expected when set date is $date, utcOffset is $utcOffset', ({ utcOffset, date, expected }) => {
    expect(getBusinessDateTime(utcOffset, date).format()).toBe(expected);
  });
});
