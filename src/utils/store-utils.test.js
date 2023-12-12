import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import {
  getBusinessDateTime,
  getOrderDateList,
  isInBreakTime,
  isInVacations,
  isInValidDays,
  isInValidTime,
  getDeliveryPreOrderTimeList,
  getPickupPreOrderTimeList,
  getDeliveryTodayTimeList,
  getPickupTodayTimeList,
  getDeliveryPreOrderValidTimePeriod,
  getPickupPreOrderTimePeriod,
  isAvailableOrderTime,
  isAvailableOnDemandOrderTime,
  checkStoreIsOpened,
  isDateTimeSoldOut,
} from './store-utils';
import Constants from './constants';

const { TIME_SLOT_NOW, DELIVERY_METHOD } = Constants;

dayjs.extend(utc);

expect.extend({
  toArrayStartWith: (received, expectedStartArray) => {
    const receivedStartArray = _.take(received, expectedStartArray.length);
    const pass = _.isEqual(receivedStartArray, expectedStartArray);
    if (pass) {
      return {
        message: () => `expected ${receivedStartArray} not to start with ${expectedStartArray}, `,
        pass: true,
      };
    }

    return {
      message: () => `expected ${receivedStartArray} start with ${expectedStartArray}`,
      pass: false,
    };
  },
  toArrayEndWith: (received, expectedEndArray) => {
    const receivedEndArray = _.takeRight(received, expectedEndArray.length);
    const pass = _.isEqual(receivedEndArray, expectedEndArray);
    if (pass) {
      return {
        message: () => `expected ${receivedEndArray} not to end with ${expectedEndArray}`,
        pass: true,
      };
    }

    return {
      message: () => `expected ${receivedEndArray} end with ${expectedEndArray}`,
      pass: false,
    };
  },
});

const storeA = {
  id: 'storeA',
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
    enablePerTimeSlotLimitForPreOrder: true,
    maxPreOrdersPerTimeSlot: 1,
  },
};

const storeB = {
  id: 'storeB',
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
    disableTodayPreOrder: true,
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
    enablePerTimeSlotLimitForPreOrder: true,
    maxPreOrdersPerTimeSlot: 2,
  },
};

const storeC = {
  id: 'storeC',
  name: 'Store C',
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
    enablePreOrder: false,
    disableTodayPreOrder: true,
    validDays: [2, 3, 5, 6],
    validTimeFrom: '10:30',
    validTimeTo: '18:30',
    deliveryRadius: 100,
    breakTimeFrom: '13:00',
    breakTimeTo: '14:00',
    vacations: [],
    disableOnDemandOrder: true,
    enablePerTimeSlotLimitForPreOrder: false,
    maxPreOrdersPerTimeSlot: null,
  },
};

const MY_UTC_OFFSET = 480;

describe('test getOrderDateList function', () => {
  test('check StoreA date list', () => {
    const currentDate = new Date('2020-12-11T10:02:17+08:00');
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

    const dateList = getOrderDateList(storeA, DELIVERY_METHOD.DELIVERY, currentDate, MY_UTC_OFFSET);
    expectedDateList.forEach((expectedDate, index) => {
      const date = dateList[index];

      expect(dayjs(date.date).isSame(expectedDate.date, 'day')).toBeTruthy();
      expect(date.isOpen).toBe(expectedDate.isOpen);
      expect(date.isToday).toBe(expectedDate.isToday);
    });
  });

  test('check StoreB date list', () => {
    const currentDate = new Date('2020-11-19T14:02:17+08:00');
    const expectedDateList = [
      {
        date: '2020-11-19T00:00:00+08:00',
        isOpen: false,
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

    const dateList = getOrderDateList(storeB, DELIVERY_METHOD.DELIVERY, currentDate, MY_UTC_OFFSET);
    expectedDateList.forEach((expectedDate, index) => {
      const date = dateList[index];

      expect(dayjs(date.date).isSame(expectedDate.date, 'day')).toBeTruthy();
      expect(date.isOpen).toBe(expectedDate.isOpen);
      expect(date.isToday).toBe(expectedDate.isToday);
    });
  });

  test('check StoreC date list', () => {
    const currentDate = new Date('2020-12-11T10:02:17+08:00');
    const expectedDateList = [
      {
        date: '2020-12-11T00:00:00+08:00',
        isOpen: false,
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
        isOpen: false,
        isToday: false,
      },
      {
        date: '2020-12-15T00:00:00+08:00',
        isOpen: false,
        isToday: false,
      },
    ];

    const dateList = getOrderDateList(storeC, DELIVERY_METHOD.DELIVERY, currentDate, MY_UTC_OFFSET);
    expectedDateList.forEach((expectedDate, index) => {
      const date = dateList[index];

      expect(dayjs(date.date).isSame(expectedDate.date, 'day')).toBeTruthy();
      expect(date.isOpen).toBe(expectedDate.isOpen);
      expect(date.isToday).toBe(expectedDate.isToday);
    });
  });
});

describe('test getDeliveryOrderTimeList function', () => {
  test('check StoreA pre order time list', () => {
    const expectedStartTimeList = ['09:00', '10:00'];
    const expectedEndTimeList = ['20:00', '21:00'];
    const expectedNotExistTimeList = ['12:00', '13:00'];
    const expectedExistTimeList = ['14:00', '15:00'];

    const timeList = getDeliveryPreOrderTimeList(storeA);

    expect(timeList).toArrayStartWith(expectedStartTimeList);
    expect(timeList).toArrayEndWith(expectedEndTimeList);
    expect(timeList).toEqual(expect.not.arrayContaining(expectedNotExistTimeList));
    expect(timeList).toEqual(expect.arrayContaining(expectedExistTimeList));
  });

  test('check StoreB pre order time list', () => {
    const expectedStartTimeList = ['01:00'];
    const expectedEndTimeList = ['23:00'];
    const expectedNotExistTimeList = ['12:00'];
    const expectedExistTimeList = ['13:00', '14:00'];
    const timeList = getDeliveryPreOrderTimeList(storeB);

    expect(timeList).toArrayStartWith(expectedStartTimeList);
    expect(timeList).toArrayEndWith(expectedEndTimeList);
    expect(timeList).toEqual(expect.not.arrayContaining(expectedNotExistTimeList));
    expect(timeList).toEqual(expect.arrayContaining(expectedExistTimeList));
  });

  test('check StoreC pre order time list', () => {
    const timeList = getDeliveryPreOrderTimeList(storeC);

    expect(_.isEmpty(timeList)).toBeTruthy();
  });
});

describe('test getPickupPreOrderTimeList function', () => {
  test('check StoreA pre order time list', () => {
    const expectedStartTimeList = ['07:00'];
    const expectedEndTimeList = ['22:30'];
    const expectedNotExistTimeList = ['12:00', '13:15', '14:00'];
    const expectedExistTimeList = ['14:15'];

    const timeList = getPickupPreOrderTimeList(storeA);

    expect(timeList).toArrayStartWith(expectedStartTimeList);
    expect(timeList).toArrayEndWith(expectedEndTimeList);
    expect(timeList).toEqual(expect.not.arrayContaining(expectedNotExistTimeList));
    expect(timeList).toEqual(expect.arrayContaining(expectedExistTimeList));
  });

  test('check StoreB pre order time list', () => {
    const expectedStartTimeList = ['00:30'];
    const expectedEndTimeList = ['23:45'];
    const expectedNotExistTimeList = ['12:00', '12:15', '13:00'];
    const expectedExistTimeList = ['13:15', '23:30'];

    const timeList = getPickupPreOrderTimeList(storeB);

    expect(timeList).toArrayStartWith(expectedStartTimeList);
    expect(timeList).toArrayEndWith(expectedEndTimeList);
    expect(timeList).toEqual(expect.not.arrayContaining(expectedNotExistTimeList));
    expect(timeList).toEqual(expect.arrayContaining(expectedExistTimeList));
  });

  test('check StoreC pre order time list', () => {
    const timeList = getPickupPreOrderTimeList(storeC);

    expect(_.isEmpty(timeList)).toBeTruthy();
  });
});

describe('test getDeliveryTodayTimeList function', () => {
  test('check storeA today time list, available immediately', () => {
    const currentTime = new Date('2020-11-19T14:02:17+08:00');
    const expectedStartTimeList = [TIME_SLOT_NOW, '16:00'];
    const expectedEndTimeList = ['20:00', '21:00'];
    const todayTimeList = getDeliveryTodayTimeList(storeA, currentTime, MY_UTC_OFFSET);

    expect(todayTimeList).toArrayStartWith(expectedStartTimeList);
    expect(todayTimeList).toArrayEndWith(expectedEndTimeList);
  });

  test('check storeA today time list, unavailable immediately', () => {
    const currentTime = new Date('2020-11-19T07:02:17+08:00');
    const expectedStartTimeList = ['09:00', '10:00'];
    const expectedEndTimeList = ['20:00', '21:00'];
    const todayTimeList = getDeliveryTodayTimeList(storeA, currentTime, MY_UTC_OFFSET);

    expect(todayTimeList).toArrayStartWith(expectedStartTimeList);
    expect(todayTimeList).toArrayEndWith(expectedEndTimeList);
  });

  test('check storeB today time list', () => {
    const currentTime = new Date('2020-11-19T14:02:17+08:00');
    const todayTimeList = getDeliveryTodayTimeList(storeB, currentTime, MY_UTC_OFFSET);

    expect(todayTimeList.length === 0).toBeTruthy();
  });
});

describe('test getPickupTodayTimeList function', () => {
  test('check storeA today time list, available immediately', () => {
    const currentTime = new Date('2020-11-19T14:02:17+08:00');
    const expectedStartTimeList = [TIME_SLOT_NOW, '14:45'];
    const expectedEndTimeList = ['22:15', '22:30'];
    const expectedNotExistTimeList = ['14:15', '14:30'];

    const todayTimeList = getPickupTodayTimeList(storeA, currentTime, MY_UTC_OFFSET);

    expect(todayTimeList).toArrayStartWith(expectedStartTimeList);
    expect(todayTimeList).toArrayEndWith(expectedEndTimeList);
    expect(todayTimeList).toEqual(expect.not.arrayContaining(expectedNotExistTimeList));
  });

  test('check storeA today time list, unavailable immediately', () => {
    const currentTime = new Date('2020-11-19T05:02:17+08:00');
    const expectedStartTimeList = ['07:00', '07:15'];
    const expectedEndTimeList = ['22:15', '22:30'];
    const expectedNotExistTimeList = ['14:00'];

    const todayTimeList = getPickupTodayTimeList(storeA, currentTime, MY_UTC_OFFSET);

    expect(todayTimeList).toArrayStartWith(expectedStartTimeList);
    expect(todayTimeList).toArrayEndWith(expectedEndTimeList);
    expect(todayTimeList).toEqual(expect.not.arrayContaining(expectedNotExistTimeList));
  });
});

describe('test getDeliveryPreOrderValidTimePeriod function', () => {
  test('check storeA delivery pre order valid time period', () => {
    const { validTimeFrom, validTimeTo } = getDeliveryPreOrderValidTimePeriod(storeA);

    expect(validTimeFrom).toBe('09:00');
    expect(validTimeTo).toBe('21:00');
  });

  test('check storeB delivery pre order valid time period', () => {
    const { validTimeFrom, validTimeTo } = getDeliveryPreOrderValidTimePeriod(storeB);

    expect(validTimeFrom).toBe('01:00');
    expect(validTimeTo).toBe('24:00');
  });

  test('check storeC delivery pre order valid time period', () => {
    const { validTimeFrom, validTimeTo } = getDeliveryPreOrderValidTimePeriod(storeC);

    expect(validTimeFrom).toBe('12:00');
    expect(validTimeTo).toBe('18:00');
  });
});

describe('test getPickupPreOrderTimePeriod function', () => {
  test('check storeA pickup pre order valid time period', () => {
    const { validTimeFrom, validTimeTo } = getPickupPreOrderTimePeriod(storeA);

    expect(validTimeFrom).toBe('07:00');
    expect(validTimeTo).toBe('22:30');
  });

  test('check storeB pickup pre order valid time period', () => {
    const { validTimeFrom, validTimeTo } = getPickupPreOrderTimePeriod(storeB);

    expect(validTimeFrom).toBe('00:30');
    expect(validTimeTo).toBe('24:00');
  });

  test('check storeC pickup pre order valid time period', () => {
    const { validTimeFrom, validTimeTo } = getPickupPreOrderTimePeriod(storeC);

    expect(validTimeFrom).toBe('11:00');
    expect(validTimeTo).toBe('18:30');
  });
});

describe('test getPreOrderTimeList function', () => {
  test.todo('test getPreOrderTimeList function');
});

describe('test checkStoreIsOpened function', () => {
  test('check storeA is open in valid time', () => {
    expect(checkStoreIsOpened(storeA, new Date('2020-11-19T07:02:17+08:00'), MY_UTC_OFFSET)).toBeTruthy();
    expect(checkStoreIsOpened(storeA, new Date('2020-11-19T03:02:17+08:00'), MY_UTC_OFFSET)).toBeTruthy();
  });

  test('check storeB is open in valid time', () => {
    expect(checkStoreIsOpened(storeB, new Date('2020-11-19T07:02:17+08:00'), MY_UTC_OFFSET)).toBeTruthy();
    expect(checkStoreIsOpened(storeB, new Date('2020-11-19T00:02:17+08:00'), MY_UTC_OFFSET)).toBeTruthy();
  });

  test('check storeC is open in valid time', () => {
    expect(checkStoreIsOpened(storeC, new Date('2020-11-19T11:02:17+08:00'), MY_UTC_OFFSET)).toBeTruthy();
    expect(checkStoreIsOpened(storeC, new Date('2020-11-19T13:02:17+08:00'), MY_UTC_OFFSET)).toBeFalsy();
    expect(checkStoreIsOpened(storeC, new Date('2020-11-19T18:02:17+08:00'), MY_UTC_OFFSET)).toBeTruthy();
  });
});

describe('test isDateTimeSoldOut function', () => {
  test('check storeA is sold out in specify date time', () => {
    const soldData = [
      {
        date: '2020-12-25T07:00:00.000Z',
        count: 1,
      },
    ];
    expect(isDateTimeSoldOut(storeA, soldData, new Date('2020-12-25T15:00:00+08:00'), MY_UTC_OFFSET)).toBeTruthy();
    expect(isDateTimeSoldOut(storeA, soldData, new Date('2020-12-25T14:00:00+08:00'), MY_UTC_OFFSET)).toBeFalsy();
  });

  test('check storeB is sold out in specify date time', () => {
    const soldData = [
      {
        date: '2020-12-25T07:00:00.000Z',
        count: 1,
      },
    ];

    expect(isDateTimeSoldOut(storeB, soldData, new Date('2020-12-25T15:00:00+08:00'), MY_UTC_OFFSET)).toBeFalsy();
    expect(isDateTimeSoldOut(storeB, soldData, new Date('2020-12-25T14:00:00+08:00'), MY_UTC_OFFSET)).toBeFalsy();
  });

  test('check storeC is sold out in specify date time', () => {
    const soldData = [
      {
        date: '2020-12-25T07:00:00.000Z',
        count: 100,
      },
    ];

    expect(isDateTimeSoldOut(storeC, soldData, new Date('2020-12-25T15:00:00+08:00'), MY_UTC_OFFSET)).toBeFalsy();
    expect(isDateTimeSoldOut(storeC, soldData, new Date('2020-12-25T14:00:00+08:00'), MY_UTC_OFFSET)).toBeFalsy();
  });
});

describe('test isAvailableOrderTime function', () => {
  test('check storeA is available Order time', () => {
    const currentTime = new Date('2020-11-19T14:02:17+08:00');
    const isAvailableOrder = isAvailableOrderTime(storeA, currentTime, MY_UTC_OFFSET);
    const isAvailablePickupOrder = isAvailableOrderTime(storeA, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.PICKUP);
    const isAvailableDeliveryOrder = isAvailableOrderTime(storeA, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.DELIVERY);

    expect(isAvailableOrder).toBeTruthy();
    expect(isAvailablePickupOrder).toBeTruthy();
    expect(isAvailableDeliveryOrder).toBeTruthy();
  });

  test('check storeA is available Order time before SH logistics time', () => {
    const currentTime = new Date('2020-11-19T08:02:17+08:00');
    const isAvailableOrder = isAvailableOrderTime(storeA, currentTime, MY_UTC_OFFSET);
    const isAvailablePickupOrder = isAvailableOrderTime(storeA, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.PICKUP);
    const isAvailableDeliveryOrder = isAvailableOrderTime(storeA, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.DELIVERY);

    expect(isAvailableOrder).toBeTruthy();
    expect(isAvailablePickupOrder).toBeTruthy();
    expect(isAvailableDeliveryOrder).toBeFalsy();
  });

  test('check storeB is available Order time in break time', () => {
    const currentTime = new Date('2020-11-19T12:02:17+08:00');
    const isAvailableOrder = isAvailableOrderTime(storeB, currentTime, MY_UTC_OFFSET);
    const isAvailablePickupOrder = isAvailableOrderTime(storeB, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.PICKUP);
    const isAvailableDeliveryOrder = isAvailableOrderTime(storeB, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.DELIVERY);

    expect(isAvailableOrder).toBeFalsy();
    expect(isAvailablePickupOrder).toBeFalsy();
    expect(isAvailableDeliveryOrder).toBeFalsy();
  });

  test('check storeC is available Order time in store closed time', () => {
    const currentTime = new Date('2020-11-19T10:21:17+08:00');
    const isAvailableOrder = isAvailableOrderTime(storeC, currentTime, MY_UTC_OFFSET);
    const isAvailablePickupOrder = isAvailableOrderTime(storeC, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.PICKUP);
    const isAvailableDeliveryOrder = isAvailableOrderTime(storeC, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.DELIVERY);

    expect(isAvailableOrder).toBeFalsy();
    expect(isAvailablePickupOrder).toBeFalsy();
    expect(isAvailableDeliveryOrder).toBeFalsy();
  });
});

describe('test isAvailableOnDemandOrderTime function', () => {
  test('test StoreA is available on demand order time', () => {
    const currentTime = new Date('2020-11-19T10:21:17+08:00');

    expect(isAvailableOnDemandOrderTime(storeA, currentTime, MY_UTC_OFFSET)).toBeTruthy();
    expect(isAvailableOnDemandOrderTime(storeA, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.PICKUP)).toBeTruthy();
    expect(isAvailableOnDemandOrderTime(storeA, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.DELIVERY)).toBeTruthy();
  });

  test('test StoreB is available on demand order time', () => {
    const currentTime = new Date('2020-11-19T10:21:17+08:00');

    expect(isAvailableOnDemandOrderTime(storeB, currentTime, MY_UTC_OFFSET)).toBeFalsy();
    expect(isAvailableOnDemandOrderTime(storeB, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.PICKUP)).toBeFalsy();
    expect(isAvailableOnDemandOrderTime(storeB, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.DELIVERY)).toBeFalsy();
  });

  test('test StoreC is available on demand order time in break time', () => {
    const currentTime = new Date('2020-11-19T13:00:17+08:00');

    expect(isAvailableOnDemandOrderTime(storeC, currentTime, MY_UTC_OFFSET)).toBeFalsy();
    expect(isAvailableOnDemandOrderTime(storeC, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.PICKUP)).toBeFalsy();
    expect(isAvailableOnDemandOrderTime(storeC, currentTime, MY_UTC_OFFSET, DELIVERY_METHOD.DELIVERY)).toBeFalsy();
  });
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
  test.each`
    utcOffset | date                                    | expected
    ${480}    | ${new Date('2020-12-15T16:23:12.000Z')} | ${'2020-12-16T00:23:12+08:00'}
    ${420}    | ${new Date('2020-12-15T10:55:55.000Z')} | ${'2020-12-15T17:55:55+07:00'}
    ${0}      | ${new Date('2020-12-15T16:00:00.000Z')} | ${'2020-12-15T16:00:00Z'}
    ${480}    | ${undefined}                            | ${dayjs().utcOffset(480)}
  `('return $expected when set date is $date, utcOffset is $utcOffset', ({ utcOffset, date, expected }) => {
    if (date) {
      expect(getBusinessDateTime(utcOffset, date).format()).toBe(expected);
    } else {
      const businessDateTime = getBusinessDateTime(utcOffset, date);
      const diff = expected.diff(businessDateTime, 'second');

      expect(diff).toBeLessThan(1);
    }
  });
});
