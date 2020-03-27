import { fetchDeliveryDetails, patchDeliveryDetails, updateDeliveryDetails } from './utils';

const sessionStorageSpy = {
  spyOn: function() {
    this.setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    this.getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    return {
      setItemSpy: this.setItemSpy,
      getItemSpy: this.getItemSpy,
    };
  },
  mockRestore: function() {
    this.setItemSpy.mockRestore();
    this.getItemSpy.mockRestore();
  },
};

const mockData = {
  deliveryDetails: () => ({
    phone: '+8617551339521',
    deliveryToAddress: 'AA Pharmacy Puchong, Jalan Kenari 1, 蒲种再也蒲种雪兰莪马来西亚',
    deliveryToLocation: { longitude: 101.6198973, latitude: 3.0444716 },
    username: 'name',
    addressDetails: '123',
  }),
};

describe('ordering.containers.Customer.utils', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('updateDeliveryDetails should update whole data', async () => {
    const { setItemSpy } = sessionStorageSpy.spyOn();
    await updateDeliveryDetails(mockData.deliveryDetails());

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy.mock.calls[0][0]).toBe('deliveryDetails');
    expect(JSON.parse(setItemSpy.mock.calls[0][1])).toMatchInlineSnapshot(`
Object {
  "addressDetails": "123",
  "deliveryToAddress": "AA Pharmacy Puchong, Jalan Kenari 1, 蒲种再也蒲种雪兰莪马来西亚",
  "deliveryToLocation": Object {
    "latitude": 3.0444716,
    "longitude": 101.6198973,
  },
  "phone": "+8617551339521",
  "username": "name",
}
`);

    sessionStorageSpy.mockRestore();
  });

  it('fetchDeliveryDetails to return correct deliveryDetails', async () => {
    const { getItemSpy } = sessionStorageSpy.spyOn();
    getItemSpy.mockReturnValueOnce(JSON.stringify(mockData.deliveryDetails()));
    const result = await fetchDeliveryDetails();

    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(result).toMatchInlineSnapshot(`
Object {
  "addressDetails": "123",
  "deliveryToAddress": "AA Pharmacy Puchong, Jalan Kenari 1, 蒲种再也蒲种雪兰莪马来西亚",
  "deliveryToLocation": Object {
    "latitude": 3.0444716,
    "longitude": 101.6198973,
  },
  "phone": "+8617551339521",
  "username": "name",
}
`);

    sessionStorageSpy.mockRestore();
  });

  it('patchDeliveryDetails to patch deliveryDetails data', async () => {
    const { setItemSpy } = sessionStorageSpy.spyOn();

    sessionStorage.setItem('deliveryDetails', JSON.stringify({ foo: 'bar' }));
    await patchDeliveryDetails({ phone: '+8610086' });

    const [arg1, arg2] = setItemSpy.mock.calls[1];
    expect(arg1).toBe('deliveryDetails');
    expect(JSON.parse(arg2)).toMatchInlineSnapshot(`
Object {
  "foo": "bar",
  "phone": "+8610086",
}
`);
    sessionStorageSpy.mockRestore();
  });
});
