const initialState = {};

/* StoreList Define =>
type store = {
    id: string
    name: string
    avatar: string
    street1: string
    street2: string
    city: string
    state: string
    country: string
    deliveryFee: number
    minimumConsumption: number
    geoDistance: number // Unit is `meter`
    isOpen: boolean
}
*/

// @types
const types = {
  SAVE_STORES: 'entities/stores/SAVE_STORES',
};

// @actions
const actions = {
  saveStores: stores => ({
    type: types.SAVE_STORES,
    stores,
  }),
};

// @reducer
const reducer = (state = initialState, action) => {
  if (Array.isArray(action.stores) && action.type === types.SAVE_STORES) {
    const { stores } = action;

    stores.forEach(store => {
      state[store.id] = store;
    });

    return { ...state };
  }
  return state;
};

export const storesActionCreators = actions;
export default reducer;

export const getAllStores = state => state.entities.stores;
export const getStoreList = state => Object.values(getAllStores(state));
