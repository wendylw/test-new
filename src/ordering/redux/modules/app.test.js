

import testStore from '../testStore';
import { actions, fetchCustomerProfile } from './app';
import { RequestError } from '../../../utils/request'
import {
    loginData,
    phoneNumberLoginData,
    fetchOnlineStoreInfoData,
    fetchCoreBusinessData,
    fetchCustomerProfileData
} from '../__fixtures__/app.fixture';


const getAppState = () => {
    return testStore.getState().app;
}

describe("src/ordering/redux/modules/app:actions and reduers", () => {
    beforeEach(() => {
        fetch.resetMocks();
    });
    describe("loginApp", () => {
        it("loginApp: CREATE_LOGIN_SUCCESS", async () => {
            const expectedAppUserState = {
                ...getAppState().user,
                consumerId: '5de768d734a443426498ec66',
                isLogin: true,
                hasOtp: false,
                isFetching: false,
            };
            fetch.mockResponseOnce(JSON.stringify(loginData));
            await testStore.dispatch(actions.loginApp({ accessToken: 'mockAccessToken', refreshToken: 'mockRefreToken' }));
            expect(expectedAppUserState).toEqual(getAppState().user);
        });
        describe("loginApp: CREATE_LOGIN_FAILURE ", () => {
            it("with code equal 401 error", async () => {
                const expectedAppUserState = {
                    ...getAppState().user,
                    isExpired: true,
                    isFetching: false,
                };
                fetch.mockRejectOnce(
                    req => Promise.reject(new RequestError('fake error message', 401))
                );
                await testStore.dispatch(actions.loginApp({ accessToken: 'mockAccessToken', refreshToken: 'mockRefreToken' }));
                expect(expectedAppUserState).toEqual(getAppState().user);
            });
            it("not 401 error", async () => {
                const expectedAppUserState = {
                    ...getAppState().user,
                    isFetching: false,
                };
                fetch.mockRejectOnce(
                    req => Promise.reject(new RequestError('fake error message', 400))
                );
                await testStore.dispatch(actions.loginApp({ accessToken: 'mockAccessToken', refreshToken: 'mockRefreToken' }));
                expect(expectedAppUserState).toEqual(getAppState().user);
            });

        });
    })

    describe("phoneNumberLogin", () => {
        it('phoneNumberLogin: CREATE_LOGIN_SUCCESS', async () => {
            const expectedAppUserState = {
                ...getAppState().user,
                consumerId: '5de768d734a443426498ec66',
                isLogin: true,
                hasOtp: false,
                isFetching: false,
            };
            fetch.mockResponseOnce(JSON.stringify(phoneNumberLoginData));
            await testStore.dispatch(actions.phoneNumberLogin({ phone: '18712345678' }));
            expect(expectedAppUserState).toEqual(getAppState().user);
        })
    });

    describe("fetchOnlineStoreInfo", () => {
        it("fetchOnlineStoreInfo:FETCH_ONLINESTOREINFO_SUCCESS", async () => {
            const expectedAppOnlineStoreInfoState = {
                ...getAppState().onlineStoreInfo,
                isFetching: false,
                id: '5bb32582b386182a6dcc72a2'
            };
            fetch.mockResponseOnce(JSON.stringify(fetchOnlineStoreInfoData));
            await testStore.dispatch(actions.fetchOnlineStoreInfo());
            expect(expectedAppOnlineStoreInfoState).toEqual(getAppState().onlineStoreInfo);

        });
    });
    describe("loadCoreBusiness", () => {
        it("loadCoreBusiness:FETCH_COREBUSINESS_SUCCESS", async () => {
            const expectedAppOnlineStoreInfoState = {
                ...getAppState().onlineStoreInfo
            };
            fetch.mockResponseOnce(JSON.stringify(fetchCoreBusinessData));
            // await actions.fetchOnlineStoreInfo();
            await testStore.dispatch(actions.fetchOnlineStoreInfo());
            expect(expectedAppOnlineStoreInfoState).toEqual(getAppState().onlineStoreInfo)
        })
    });
    describe("loadCustomerProfile", () => {
        it("FETCH_CUSTOMER_PROFILE_SUCCESS", async () => {
            const customerId = '190e64b2-ff1b-4d04-bbbf-540e4b001dd6';
            const expectedAppUserState = {
                ...getAppState().user,
                storeCreditsBalance: 8.42,
                customerId,
            };
            fetch.mockResponseOnce(JSON.stringify(fetchCustomerProfileData));
            const { dispatch, getState } = testStore;
            await actions.loadCustomerProfile()(dispatch, getState);
            expect(expectedAppUserState).toEqual(getAppState().user)

        });

    })
});
