import { HOME_TYPES } from '../../../cashback/redux/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  // console.log(state);
  // console.log(action);
  // if (action.type === HOME_TYPES.SET_CUSTOMER_ID_SUCCESS) {
  //   const { customerId } = action;

  //   return { ...state, [customerId]: [] };
  // }

  // if (action.type === HOME_TYPES.GET_CASHBACK_HISTORIES_SUCCESS) {
  //   return { ...state, [state.customerId]: action.logs };
  // }

  return state;
}

export default reducer;

// selectors

export const getAllBusinesses = (state) => state.entities.loyaltyHistories;

export const getLoyaltyHistoriesByCustomerId = (state, customerId) => getAllBusinesses(state)[customerId];
