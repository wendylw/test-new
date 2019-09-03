const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.loyaltyHistories) {
    const { customerId } = action.loyaltyHistories;

    return { ...state, [customerId]: action.loyaltyHistories };
  }

  return state;
}

export default reducer;

// selectors

export const getAllBusinesses = (state) => state.entities.loyaltyHistories;

export const getLoyaltyHistoriesByCustomerId = (state, customerId) => getAllBusinesses(state)[customerId];
