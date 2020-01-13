import testStore from '../testStore';
import { actions } from './thankYou';
import { orderData } from '../__fixtures__/thankYou.fixture';

const getThankyouState = () => {
  return testStore.getState().thankYou;
};
describe('src/ordering/redux/modules/thankYou:actions and reducer', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  describe('loadOrder', () => {
    it('FETCH_ORDER_SUCCESS', async () => {
      const orderId = '815520056159098';
      const expectedThankyouState = {
        ...getThankyouState(),
        orderId,
      };
      fetch.mockResponseOnce(JSON.stringify(orderData));
      const { dispatch } = testStore;
      await actions.loadOrder(orderId)(dispatch);
      expect(expectedThankyouState).toEqual(getThankyouState());
    });
  });
});
