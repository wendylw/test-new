const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;

    if (data.business) {
      const { business } = data;
      return { ...state, [business.name]: business };
    }
  }
  return state;
};

export default reducer;

// selectors

export const getAllBusinesses = (state) => state.entities.businesses;

export const getBusinessByName = (state, businessName) => getAllBusinesses(state)[businessName];
