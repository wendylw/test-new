import appReducers, { initialState } from './app';
import { APP_TYPES as types } from '../types';
import { getReducerNewState } from '../../../utils/testHelper';

describe('src/ordering/redux/modules/app.js:reducers', () => {
  it('should return the initial state', () => {
    expect(appReducers(undefined, {})).toEqual(initialState);
  });
  describe('user', () => {
    const nameField = 'user';
    const accessToken = 'mockAccessToken';
    const refreshToken = 'mockRefreshToken';
    let mockUserAction = {
      type: types.SHOW_LOGIN_PAGE,
      response: { access_token: accessToken, refresh_token: refreshToken, consumerId: '123456', islogin: true },
      code: 200,
      prompt: 'mockPrompt',
    };
    it('SHOW_LOGIN_PAGE', () => {
      const action = { type: types.SHOW_LOGIN_PAGE };
      const expectedState = { ...initialState.user, showLoginPage: true };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('HIDE_LOGIN_PAGE', () => {
      const expectedState = { ...initialState.user, showLoginPage: false };
      expect(getReducerNewState(appReducers, { type: types.HIDE_LOGIN_PAGE }, nameField)).toEqual(expectedState);
    });

    it('isFetching should be true', () => {
      const expectedState = { ...initialState.user, isFetching: true };
      expect(getReducerNewState(appReducers, { type: types.FETCH_LOGIN_STATUS_REQUEST }, nameField)).toEqual(
        expectedState
      );
      expect(getReducerNewState(appReducers, { type: types.GET_OTP_REQUEST }, nameField)).toEqual(expectedState);
      expect(getReducerNewState(appReducers, { type: types.CREATE_OTP_REQUEST }, nameField)).toEqual(expectedState);
    });
    it('isFetching should be false', () => {
      const expectedState = { ...initialState.user, isFetching: false };
      expect(getReducerNewState(appReducers, { type: types.FETCH_LOGIN_STATUS_FAILURE }, nameField)).toEqual(
        expectedState
      );
      expect(getReducerNewState(appReducers, { type: types.GET_OTP_FAILURE }, nameField)).toEqual(expectedState);
      expect(getReducerNewState(appReducers, { type: types.CREATE_OTP_FAILURE }, nameField)).toEqual(expectedState);
    });
    it('RESET_OTP_STATUS', () => {});
    it('CREATE_OTP_SUCCESS', () => {
      const expectedState = { ...initialState.user, isFetching: false, accessToken, refreshToken };
      mockUserAction.type = types.CREATE_OTP_SUCCESS;
      expect(getReducerNewState(appReducers, mockUserAction, nameField)).toEqual(expectedState);
    });
  });
});
