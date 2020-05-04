import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _get from 'lodash/get';

import Url from '../../../utils/url';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getBusiness } from './app';
import { getCurrentStoreId } from './home';

const initialState = {
  currentTableId: '',
  tables: [], // {id:'', name:'', seatingCapacity:''}
  storeHasCode: '',
};

export const types = {
  // fetch Store Tables
  FETCH_STORE_TABLES_REQUEST: 'STORES/TABLES/FETCH_STORE_TABLES_REQUEST',
  FETCH_STORE_TABLES_SUCCESS: 'STORES/TABLES/FETCH_STORE_TABLES_SUCCESS',
  FETCH_STORE_TABLES_FAILURE: 'STORES/TABLES/FETCH_STORE_TABLES_FAILURE',

  // generator STORE HASH CODE
  GENERATOR_STORE_HASH_CODE_REQUEST: 'STORES/TABLES/GENERATOR_STORE_HASH_CODE_REQUEST',
  GENERATOR_STORE_HASH_CODE_SUCCESS: 'STORES/TABLES/GENERATOR_STORE_HASH_CODE_SUCCESS',
  GENERATOR_STORE_HASH_CODE_FAILURE: 'STORES/TABLES/GENERATOR_STORE_HASH_CODE_FAILURE',
  // set table id
  SET_TABLE_ID: 'STORES/TABLES/SET_TABLE_ID',
};

export const actions = {
  generatorStoreHashCode: () => (dispatch, getState) => {
    const state = getState();
    const table = getCurrentTable(state);
    const storeId = getCurrentStoreId(state);
    const tableName = _get(table, 'name', '');
    return dispatch({
      [API_REQUEST]: {
        types: [
          types.GENERATOR_STORE_HASH_CODE_REQUEST,
          types.GENERATOR_STORE_HASH_CODE_SUCCESS,
          types.GENERATOR_STORE_HASH_CODE_FAILURE,
        ],
        payload: {
          tableId: tableName,
        },
        ...Url.API_URLS.POST_STORE_HASH_DATA(storeId),
      },
    });
  },
  loadStoreTables: () => (dispatch, getState) => {
    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [types.FETCH_STORE_TABLES_REQUEST, types.FETCH_STORE_TABLES_SUCCESS, types.FETCH_STORE_TABLES_FAILURE],
        variables: {
          business: getBusiness(getState()),
          storeId: getCurrentStoreId(getState()),
        },
        endpoint: Url.apiGql('Tables'),
      },
    });
  },

  setTableId: tableId => ({
    type: types.SET_TABLE_ID,
    tableId: tableId,
  }),
};

const tablesReducer = (state = initialState.tables, action) => {
  switch (action.type) {
    case types.FETCH_STORE_TABLES_SUCCESS:
      const { tables } = action.responseGql.data;
      const stateTables = tables.map(table => {
        return {
          id: table.id,
          name: table.tableName,
          seatingCapacity: table.seatingCapacity,
        };
      });
      return stateTables;

    default:
      return state;
  }
};

const currentTableIdReducer = (state = initialState.currentTableId, action) => {
  switch (action.type) {
    case types.SET_TABLE_ID:
      return action.tableId;
    default:
      return state;
  }
};

const storeHashCodeReducer = (state = initialState.storeHasCode, action) => {
  switch (action.type) {
    case types.GENERATOR_STORE_HASH_CODE_SUCCESS:
      return action.response.hex;
    default:
      return state;
  }
};

export default combineReducers({
  tables: tablesReducer,
  currentTableId: currentTableIdReducer,
  storeHashCode: storeHashCodeReducer,
});

export const getTables = state => {
  return state.tables.tables;
};

export const getCurrentTableId = state => state.tables.currentTableId;

export const getStoreHashCode = state => state.tables.storeHashCode;

export const getCurrentTable = createSelector([getTables, getCurrentTableId], (tables, currentTableId) => {
  return tables.find(table => {
    return table.id === currentTableId;
  });
});
