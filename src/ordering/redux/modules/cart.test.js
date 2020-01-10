import { actions } from './cart';
import testStore from '../testStore';
import { APIRequest } from './api';

describe('test action', () => {
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