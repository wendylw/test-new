
import { APIRequest } from './api';
import testStore from '../testStore';

const getHomeState = (state) => {
    return state.getState().home;
}
describe('rc/ordering/redux/modules/cart:actions and reducers', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });
    it('hello world test', () => {
        fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

        //assert on the response
        APIRequest('google').then(res => {
            expect(res.data).toEqual('12345')
        });

        // testStore.dispatch(actions.loadPendingPaymentList())
        //     .then(() => {
        //         const newState = testStore.getState();
        //         expect(newState).toBe('hello');
        //     });
        // expect(fetch.mock.calls.length).toEqual(1);
    });
});