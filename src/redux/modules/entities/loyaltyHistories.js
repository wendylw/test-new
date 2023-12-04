import { APP_TYPES } from '../../../cashback/redux/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.type === APP_TYPES.GET_CASHBACK_HISTORIES_SUCCESS) {
    const { response, params } = action;
    const { customerId } = params || {};
    const { logs } = response || {};

    if (customerId) {
      return { ...state, [customerId]: logs };
    }
  }

  return state;
};

export default reducer;

// selectors

export const getAllLoyaltyHistories = state => state.entities.loyaltyHistories;

export const getLoyaltyHistoriesByCustomerId = (state, customerId) => getAllLoyaltyHistories(state)[customerId];
