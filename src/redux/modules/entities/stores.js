const initialState = {};

function transferStoreName(s) {
  const { name, beepBrandName, beepStoreNameLocationSuffix } = s;
  const newS = {
    ...s,
    name: beepBrandName && beepStoreNameLocationSuffix ? `${beepBrandName}-${beepStoreNameLocationSuffix}` : name,
  };
  return newS;
}

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;
    const { business } = data || {};

    if (business && business.stores && !business.country) {
      const { stores } = business;
      const newStores = {};

      stores.forEach(s => {
        if (s.id) {
          newStores[s.id] = transferStoreName(s);
        }
      });
      return { ...state, ...newStores };
    }
  }

  return state;
};

export default reducer;

// selectors

export const getAllStores = state => state.entities.stores;

export const getStoreById = (state, storeId) => getAllStores(state)[storeId];

export const getCoreStoreList = state => Object.values(state.entities.stores);
