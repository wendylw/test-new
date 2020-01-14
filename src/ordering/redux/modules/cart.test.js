import testStore from '../testStore';
import { emptyShoppingCartData } from '../__fixtures__/cart.fixture';
import { emptyShoppingCart } from './cart';

describe('src/ordering/redux/modules/cart:actions and reducers', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  it('clearAll', async () => {
    const expectedState = {
      ...testStore.getState(),
    };
    fetch.mockResponseOnce(JSON.stringify(emptyShoppingCartData));
    await testStore.dispatch(emptyShoppingCart());
    expect(testStore.getState()).toEqual(expectedState);
  });
});

// describe('src/ordering/redux/modules/cart', () => {
//     it('getBusinessInfo: get from state', () => {
//         const expectedResult = 'hello';
//         const res = getBusinessInfo(testStore.getState());
//         console.log('测试----test---');
//         console.log(testStore.getState().app)
//         expect(res).toEqual(expectedResult);
//     });
// });
