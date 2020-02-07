import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import api from '../../../redux/middlewares/api';
import apiGql from '../../../redux/middlewares/apiGql';

// import * as actions from '../../actions/TodoActions';
//import * as types from '../../constants/ActionTypes';

import { actions } from './app';
import { APP_TYPES as types } from '../types';
import { commonSuccessData, commonFailResponse } from '../__fixtures__/common.fixture';

const middlewares = [thunk, apiGql, api];
const mockStore = configureMockStore(middlewares);
const store = mockStore({});

describe('src/ordering/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });
  describe('action creators', () => {
    it('showLogin', () => {
      const expectedAction = {
        type: types.SHOW_LOGIN_PAGE,
      };
      expect(actions.showLogin()).toEqual(expectedAction);
    });
  });

  describe('Async Action Creators', () => {
    describe('fetchOnlineStoreInfo', () => {
      it(':Success', () => {
        fetch.mockResponseOnce(JSON.stringify(commonSuccessData));
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_SUCCESS, responseGql: commonSuccessData },
        ];
        return store.dispatch(actions.fetchOnlineStoreInfo()).then(() => {
          // return of async actions
          expect(store.getActions()).toEqual(expectedActions);
        });
      });
      it('Failure', () => {
        fetch.mockRejectOnce(req => Promise.reject(commonFailResponse));
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_FAILURE, code: 401, message: 'fake error message' },
        ];
        return store.dispatch(actions.fetchOnlineStoreInfo()).then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
      });
    });
  });
});
