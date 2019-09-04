const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;
    const { business } = data || {};

    if (business && business.stores) {
      const { stores } = business;
      const newStores = {};

      stores.forEach(s => {
        if (s.id) {
          newStores[s.id] = s;
        }
      });

      return { ...state, ...newStores };
    }
  }

  return state;
};

export default reducer;

// selectors

export const getAllStores = (state) => state.entities.stores;

export const getStoreById = (state, storeId) => getAllStores(state)[storeId];

