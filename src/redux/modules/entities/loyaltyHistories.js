import { HOME_TYPES } from '../../../cashback/redux/types';
import { resolve } from 'dns';

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.type === HOME_TYPES.GET_CASHBACK_HISTORIES_SUCCESS) {
    const { response, params } = action;
    const { customerId } = params || {};
    const { logs } = response || {};

    if (customerId) {
      return { ...state, [customerId]: logs };
    }
  }

  return state;
}

export default reducer;

// selectors

export const getAllBusinesses = (state) => state.entities.loyaltyHistories;

export const getLoyaltyHistoriesByCustomerId = (state, customerId) => getAllBusinesses(state)[customerId];
