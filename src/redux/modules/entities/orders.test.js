import ordersReducers, { getAllOrders, getOrderByOrderId } from './orders';
import mockState from '../../__fixtures__/state.fixture';

describe('src/redux/modules/entities/orders.test.js:reducers', () => {
  it('should return the initial state', () => {
    expect(ordersReducers(undefined, {})).toEqual({});
  });
  describe('action with responseGql', () => {
    it('has orders', () => {
      const action = {
        type: 'whatever',
        responseGql: {
          data: {
            orders: [
              {
                id: '105e09a7-6c04-4886-9000-e2fa2373b8e5',
                total: 1,
                orderId: '815520056159098',
                status: 'pendingPayment',
                tableId: null,
                storeId: '5bb7127e92efcf71784c1727',
              },
            ],
            error: null,
            redirectUrl: `/ordering/thank-you`,
          },
        },
      };
      const expectedState = {
        '815520056159098': {
          id: '105e09a7-6c04-4886-9000-e2fa2373b8e5',
          orderId: '815520056159098',
          status: 'pendingPayment',
          storeId: '5bb7127e92efcf71784c1727',
          tableId: null,
          total: 1,
        },
      };
      expect(ordersReducers({}, action)).toEqual(expectedState);
    });
    it('has order', () => {
      const action = {
        type: 'whatever',
        responseGql: {
          data: {
            order: {
              id: '105e09a7-6c04-4886-9000-e2fa2373b8e5',
              total: 1,
              orderId: '815520056159098',
              status: 'pendingPayment',
              tableId: null,
              storeId: '5bb7127e92efcf71784c1727',
            },
            error: null,
            redirectUrl: `/ordering/thank-you`,
          },
        },
      };
      const expectedState = {
        '815520056159098': {
          id: '105e09a7-6c04-4886-9000-e2fa2373b8e5',
          orderId: '815520056159098',
          status: 'pendingPayment',
          storeId: '5bb7127e92efcf71784c1727',
          tableId: null,
          total: 1,
        },
      };
      expect(ordersReducers({}, action)).toEqual(expectedState);
    });
  });
});
describe('src/redux/modules/entities/orders.test.js:selectors', () => {
  it('getAllBusinesses', () => {
    expect(getAllOrders(mockState)).toEqual(mockState.entities.orders);
  });
  it('getLoyaltyHistoriesByCustomerId', () => {
    expect(getOrderByOrderId(mockState, '815520056159098')).toEqual({
      id: '105e09a7-6c04-4886-9000-e2fa2373b8e5',
      orderId: '815520056159098',
      status: 'pendingPayment',
      storeId: '5bb7127e92efcf71784c1727',
      tableId: null,
      total: 1,
    });
  });
});
