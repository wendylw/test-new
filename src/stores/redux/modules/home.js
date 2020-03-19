import Url from '../../../utils/url';

import { API_REQUEST } from '../../../redux/middlewares/api';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getStoreById } from '../../../redux/modules/entities/stores';
import { getBusiness } from './app';

const initialState = {
  storeHashCode: null,
  currentStoreId: null,
  enableDelivery: false,
  storeIds: [],
};

export const types = {
  // fetch coreStores
  FETCH_CORESTORES_REQUEST: 'STORES/HOME/FETCH_CORESTORES_REQUEST',
  FETCH_CORESTORES_SUCCESS: 'STORES/HOME/FETCH_CORESTORES_SUCCESS',
  FETCH_CORESTORES_FAILURE: 'STORES/HOME/FETCH_CORESTORES_FAILURE',

  // fetch store Hash code
  FETCH_STORE_HASHCODE_REQUEST: 'STORES/HOME/FETCH_STORE_HASHCODE_REQUEST',
  FETCH_STORE_HASHCODE_SUCCESS: 'STORES/HOME/FETCH_STORE_HASHCODE_SUCCESS',
  FETCH_STORE_HASHCODE_FAILURE: 'STORES/HOME/FETCH_STORE_HASHCODE_FAILURE',

  // operate current store
  SET_CURRENT_STORE: 'STORES/HOME/SET_CURRENT_STORE',
  CLEAR_CURRENT_STORE: 'STORES/HOME/CLEAR_CURRENT_STORE',
};

export const actions = {
  loadCoreStores: callback => async (dispatch, getState) => {
    const business = getBusiness(getState());
    await dispatch(fetchCoreStores({ business }));

    // if has selected an store, then directly go to next step
    const currentStoreId = getCurrentStoreId(getState());
    if (currentStoreId) {
      callback(currentStoreId);
    }
  },

  getStoreHashData: storeId => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_STORE_HASHCODE_REQUEST,
        types.FETCH_STORE_HASHCODE_SUCCESS,
        types.FETCH_STORE_HASHCODE_FAILURE,
      ],
      ...Url.API_URLS.GET_STORE_HASH_DATA(storeId),
    },
  }),

  setCurrentStore: storeId => ({
    type: types.SET_CURRENT_STORE,
    storeId,
  }),

  clearCurrentStore: () => ({
    type: types.CLEAR_CURRENT_STORE,
  }),
};

const fetchCoreStores = variables => ({
  [FETCH_GRAPHQL]: {
    types: [types.FETCH_CORESTORES_REQUEST, types.FETCH_CORESTORES_SUCCESS, types.FETCH_CORESTORES_FAILURE],
    endpoint: Url.apiGql('CoreStores'),
    variables,
  },
});

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_STORE_HASHCODE_SUCCESS: {
      const { response } = action;
      const { redirectTo } = response || {};

      return { ...state, storeHashCode: redirectTo };
    }
    case types.SET_CURRENT_STORE:
    case types.CLEAR_CURRENT_STORE: {
      const { storeId } = action;

      return { ...state, currentStoreId: storeId };
    }
    case types.FETCH_CORESTORES_SUCCESS: {
      const { business } = action.responseGql.data;
      const { qrOrderingSettings, stores } = business || {};
      const { enableDelivery } = qrOrderingSettings || {};
      const validStores = (stores || []).filter(s => s.isOnline && !s.isDeleted);
      const currentStoreId = validStores && validStores.length === 1 ? validStores[0].id : null;

      return { ...state, isFetching: false, enableDelivery, storeIds: validStores.map(s => s.id), currentStoreId };
    }
    case types.FETCH_CORESTORES_FAILURE: {
      return { ...state, isFetching: false };
    }
    default:
      return state;
  }
};

export default reducer;

export const getAllStores = state => {
  return state.home.storeIds.map(id => getStoreById(state, id));
};

export const getOneStoreInfo = (state, storeId) => {
  return getStoreById(state, storeId);
};

export const getDeliveryStatus = state => state.home.enableDelivery;
export const getCurrentStoreId = state => state.home.currentStoreId;
export const getStoreHashCode = state => state.home.storeHashCode;
export const showStores = state => !state.home.isFetching;
