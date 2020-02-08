import reducer, { initialState } from './app';
import { APP_TYPES as types } from '../types';

describe('src/ordering/redux/modules/app.js:reducers', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  describe('user', () => {
    it('SHOW_LOGIN_PAGE', () => {
      const newState = reducer(undefined, { type: types.SHOW_LOGIN_PAGE });
      expect(newState.user).toEqual({ ...initialState.user, showLoginPage: true });
    });
  });
});
