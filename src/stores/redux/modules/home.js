import Url from '../../../utils/url';
import config from '../../../config';

import { API_REQUEST } from '../../../redux/middlewares/api';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getStoreById } from '../../../redux/modules/entities/stores';
import { getBusiness } from './app';

export const initialState = {
  storeHashCode: null,
  currentStoreId: null,
  enableDelivery: false,
  storeIds: [],
  currentOrderMethod: '',
  deliveryRadius: 0,
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

  // fetch coreBusiness
  FETCH_COREBUSINESS_REQUEST: 'ORDERING/APP/FETCH_COREBUSINESS_REQUEST',
  FETCH_COREBUSINESS_SUCCESS: 'ORDERING/APP/FETCH_COREBUSINESS_SUCCESS',
  FETCH_COREBUSINESS_FAILURE: 'ORDERING/APP/FETCH_COREBUSINESS_FAILURE',

  // set order method
  SET_ORDER_METHOD: 'STORES/HOME/SET_ORDER_METHOD',
};

export const actions = {
  loadCoreStores: () => (dispatch, getState) => {
    const state = getState();
    const business = getBusiness(state);

    return dispatch(fetchCoreStores({ business }));
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

  loadCoreBusiness: id => dispatch => {
    const { storeId, business } = config;
    return dispatch(fetchCoreBusiness({ business, storeId: id || storeId }));
  },

  setOrderMethod: method => ({
    type: types.SET_ORDER_METHOD,
    method,
  }),
};

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [types.FETCH_COREBUSINESS_REQUEST, types.FETCH_COREBUSINESS_SUCCESS, types.FETCH_COREBUSINESS_FAILURE],
    endpoint: Url.apiGql('CoreBusiness'),
    variables,
  },
});

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

      return { ...state, isFetching: false, enableDelivery, storeIds: validStores.map(s => s.id) };
    }
    case types.FETCH_CORESTORES_FAILURE: {
      return { ...state, isFetching: false };
    }
    case types.SET_ORDER_METHOD: {
      return {
        ...state,
        currentOrderMethod: action.method,
      };
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
export const getDeliveryRadius = state => state.home.deliveryRadius;

export const showStores = state => !state.home.isFetching;

export const getCurrentOrderMethod = state => state.home.currentOrderMethod;
