import { createSelector } from 'reselect';
import _get from 'lodash/get';

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;
    const { business } = data || {};

    if (business && business.stores) {
      const { stores } = business;
      const businessUseStorehubLogistics = _get(business, 'qrOrderingSettings.useStorehubLogistics', false);

      const newStores = {};

      stores.forEach(s => {
        if (s.id) {
          Object.assign(s.qrOrderingSettings, {
            useStorehubLogistics: _get(s, 'qrOrderingSettings.useStorehubLogistics', businessUseStorehubLogistics),
          });

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

export const getAllStores = state => state.entities.stores;

export const getStores = createSelector(getAllStores, allStores => Object.values(allStores));

export const getStoreById = (state, storeId) => getAllStores(state)[storeId];
