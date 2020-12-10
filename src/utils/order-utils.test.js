import { isInBreakTime, isInVacations, isInValidDays, isInValidTime } from './order-utils';
import dayjs from 'dayjs';

describe('test isAvailableOrderTime function', () => {
  test.each`
    inValidDays | inValidTime | inBreakTime | inVacations | expected
    ${true}     | ${true}     | ${true}     | ${true}     | ${true}
  `(
    'return $expected, when inValidDays:$inValidDays, inValidTime:$inValidTime, inBreakTime:$inBreakTime, inVacations:$inVacations',
    ({ inValidDays, inValidTime, inBreakTime, inVacations, expected }) => {
      // how to write UT
    }
  );
});

describe('test isInValidDays function', () => {
  const fridayDate = '2020-12-04T00:00:00+08:00';
  const sundayDate = '2020-11-29T00:00:00+08:00';
  const saturdayDate = '2020-12-26T00:00:00+08:00';

  test.each`
    date            | validDays       | expected
    ${fridayDate}   | ${[0, 1, 2]}    | ${false}
    ${fridayDate}   | ${[5]}          | ${true}
    ${sundayDate}   | ${[2, 3, 4]}    | ${false}
    ${sundayDate}   | ${[1, 0]}       | ${true}
    ${saturdayDate} | ${[1, 2, 3, 4]} | ${false}
    ${saturdayDate} | ${[6]}          | ${true}
    ${saturdayDate} | ${[]}           | ${false}
    ${saturdayDate} | ${null}         | ${false}
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
