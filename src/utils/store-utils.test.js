import {
  getBusinessDateTime,
  getOrderDateList,
  isInBreakTime,
  isInVacations,
  isInValidDays,
  isInValidTime,
  getDeliveryPreOrderTimeList,
  getPickupPreOrderTimeList,
  getPreOrderTimeList,
  getDeliveryTodayTimeList,
} from './store-utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import Constants from './constants';
const { TIME_SLOT_NOW } = Constants;

dayjs.extend(utc);

const storeA = {
  id: '5fb75acec02865682d5662cb',
  name: 'Store A',
  isOnline: true,
  isDeleted: null,
  enableDigital: false,
  street1: 'Kedah, Perak',
  street2: '',
  city: 'Sungai Siput',
  state: 'Perak',
  country: 'Malaysia',
  location: {
    longitude: 101.6141592,
    latitude: 3.1615363,
  },
  fulfillmentOptions: ['Delivery', 'Pickup'],
  distance: null,
  deliveryFee: null,
  qrOrderingSettings: {
    minimumConsumption: null,
    useStorehubLogistics: true,
    enableDelivery: true,
    enableLiveOnline: true,
    enablePreOrder: true,
    disableTodayPreOrder: false,
    validDays: [2, 3, 4, 5, 6],
    validTimeFrom: '06:30',
    validTimeTo: '22:30',
    deliveryRadius: 100000000,
    breakTimeFrom: '12:00',
    breakTimeTo: '14:00',
    vacations: [
      {
        vacationTimeFrom: '2020/11/21',
        vacationTimeTo: '2020/11/22',
      },
    ],
    disableOnDemandOrder: false,
  },
};

const storeB = {
  id: '5fb75acec02865682d5662cb',
  name: 'Store B',
  isOnline: true,
  isDeleted: null,
  enableDigital: false,
  street1: 'Kedah, Perak',
  street2: '',
  city: 'Sungai Siput',
  state: 'Perak',
  country: 'Malaysia',
  location: {
    longitude: 101.6141592,
    latitude: 3.1615363,
  },
  fulfillmentOptions: ['Delivery', 'Pickup'],
  distance: null,
  deliveryFee: null,
  qrOrderingSettings: {
    minimumConsumption: null,
    useStorehubLogistics: false,
    enableDelivery: true,
    enableLiveOnline: true,
    enablePreOrder: true,
    disableTodayPreOrder: false,
    validDays: [1, 2, 3, 4, 5, 6, 7],
    validTimeFrom: '00:00',
    validTimeTo: '24:00',
    deliveryRadius: 100000000,
    breakTimeFrom: '12:00',
    breakTimeTo: '13:00',
    vacations: [
      {
        vacationTimeFrom: '2020/11/21',
        vacationTimeTo: '2020/11/22',
      },
    ],
    disableOnDemandOrder: true,
  },
};

describe('test getOrderDateList function', () => {
  test('check StoreA date list', () => {
    const currentDate = dayjs('2020-12-11T10:02:17+08:00');
    const expectedDateList = [
      {
        date: '2020-12-11T00:00:00+08:00',
        isOpen: true,
        isToday: true,
      },
      {
        date: '2020-12-12T00:00:00+08:00',
        isOpen: false,
        isToday: false,
      },
      {
        date: '2020-12-13T00:00:00+08:00',
        isOpen: false,
        isToday: false,
      },
      {
        date: '2020-12-14T00:00:00+08:00',
        isOpen: true,
        isToday: false,
      },
      {
        date: '2020-12-15T00:00:00+08:00',
        isOpen: true,
        isToday: false,
      },
    ];

    const dateList = getOrderDateList(storeA, currentDate);
    expectedDateList.forEach((expectedDate, index) => {
      expect(dateList[index]).toEqual(expectedDate);
    });
  });

  test('check StoreB date list', () => {
    const currentDate = dayjs('2020-11-19T14:02:17+08:00');
    const expectedDateList = [
      {
        date: '2020-11-19T00:00:00+08:00',
        isOpen: true,
        isToday: true,
      },
      {
        date: '2020-11-20T00:00:00+08:00',
        isOpen: true,
        isToday: false,
      },
      {
        date: '2020-11-21T00:00:00+08:00',
        isOpen: false,
        isToday: false,
      },
      {
        date: '2020-11-22T00:00:00+08:00',
        isOpen: false,
        isToday: false,
      },
      {
        date: '2020-11-23T00:00:00+08:00',
        isOpen: true,
        isToday: false,
      },
    ];

    const dateList = getOrderDateList(storeB, currentDate);
    expectedDateList.forEach((expectedDate, index) => {
      expect(dateList[index]).toEqual(expectedDate);
    });
  });
});

describe('test getDeliveryOrderTimeList function', () => {
  test('check StoreA pre order time list', () => {
    const expectedTimeList = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    expect(getDeliveryPreOrderTimeList(storeA)).toEqual(expectedTimeList);
  });

  test('check StoreB pre order time list', () => {
    const expectedFirstTime = '01:00';
    const expectedEndTime = '23:00';
    const expectedNotExistTimeList = ['12:00'];
    const expectedExistTimeList = ['13:00', '14:00'];
    const timeList = getDeliveryPreOrderTimeList(storeB);

    expect(_.head(timeList)).toBe(expectedFirstTime);
    expect(_.last(timeList)).toBe(expectedEndTime);
    expect(_.intersection(timeList, expectedNotExistTimeList).length === 0).toBeTruthy();
    expect(_.intersection(timeList, expectedExistTimeList).length === expectedExistTimeList.length).toBeTruthy();
  });
});

describe('test getPickupPreOrderTimeList function', () => {
  test('check StoreA pre order time list', () => {
    const expectedFirstTime = '07:00';
    const expectedEndTime = '22:30';
    const expectedNotExistTimeList = ['12:00', '13:15', '14:00'];
    const expectedExistTimeList = ['14:15'];

    const timeList = getPickupPreOrderTimeList(storeA);

    expect(_.head(timeList)).toBe(expectedFirstTime);
    expect(_.last(timeList)).toBe(expectedEndTime);
    expect(_.intersection(timeList, expectedNotExistTimeList).length === 0).toBeTruthy();
    expect(_.intersection(timeList, expectedExistTimeList).length === expectedExistTimeList.length).toBeTruthy();
  });

  test('check StoreB pre order time list', () => {
    const expectedFirstTime = '00:30';
    const expectedEndTime = '24:00';
    const expectedNotExistTimeList = ['12:00', '12:15', '13:00'];
    const expectedExistTimeList = ['13:15', '23:30'];

    const timeList = getPickupPreOrderTimeList(storeB);

    expect(_.head(timeList)).toBe(expectedFirstTime);
    expect(_.last(timeList)).toBe(expectedEndTime);
    expect(_.intersection(timeList, expectedNotExistTimeList).length === 0).toBeTruthy();
    expect(_.intersection(timeList, expectedExistTimeList).length === expectedExistTimeList.length).toBeTruthy();
  });
});

describe('test getDeliveryTodayTimeList function', () => {
  test('check storeA today time list, available immediately', () => {
    const currentTime = dayjs('2020-11-19T14:02:17+08:00');
    const expectedStartTimeList = [TIME_SLOT_NOW, '16:00'];
    const expectedEndTimeList = ['19:00', '20:00'];
    const todayTimeList = getDeliveryTodayTimeList(storeA, currentTime);

    expect(_.slice(todayTimeList, 0, expectedStartTimeList.length)).toEqual(expectedStartTimeList);
    expect(_.slice(todayTimeList, todayTimeList.length - expectedEndTimeList.length)).toEqual(expectedEndTimeList);
  });

  test('check storeA today time list, unavailable immediately', () => {
    const currentTime = dayjs('2020-11-19T07:02:17+08:00');
    const expectedStartTimeList = ['09:00', '10:00'];
    const expectedEndTimeList = ['19:00', '20:00'];
    const todayTimeList = getDeliveryTodayTimeList(storeA, currentTime);

    expect(_.slice(todayTimeList, 0, expectedStartTimeList.length)).toEqual(expectedStartTimeList);
    expect(_.slice(todayTimeList, todayTimeList.length - expectedEndTimeList.length)).toEqual(expectedEndTimeList);
  });
});

describe('test getPreOrderTimeList function', () => {
  test.todo('How to mock a module specify function ?');
});

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
