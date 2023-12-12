import loyaltyReducers, { getAllLoyaltyHistories, getLoyaltyHistoriesByCustomerId } from './loyaltyHistories';
import mockState from '../../__fixtures__/state.fixture';
import { HOME_TYPES } from '../../../cashback/redux/types';

describe('src/redux/modules/entities/loyaltyHistories.js:reducers', () => {
  it('should return the initial state', () => {
    expect(loyaltyReducers(undefined, {})).toEqual({});
  });
  it('actionType:HOME_TYPES.GET_CASHBACK_HISTORIES_SUCCESS', () => {
    const action = {
      type: HOME_TYPES.GET_CASHBACK_HISTORIES_SUCCESS,
      response: {
        logs: 'mock log',
      },
      params: {
        customerId: '123',
      },
    };
    const expectedState = {
      '123': 'mock log',
    };
    expect(loyaltyReducers({}, action)).toEqual(expectedState);
  });
  it('other action type', () => {
    expect(loyaltyReducers({}, { type: 'whatever' })).toEqual({});
  });
});
describe('src/redux/modules/entities/loyaltyHistories.js:selectors', () => {
  it('getAllLoyaltyHistories', () => {
    expect(getAllLoyaltyHistories(mockState)).toEqual(mockState.entities.loyaltyHistories);
  });
  it('getLoyaltyHistoriesByCustomerId', () => {
    expect(getLoyaltyHistoriesByCustomerId(mockState, '123')).toEqual({ test: 'hello' });
  });
});
