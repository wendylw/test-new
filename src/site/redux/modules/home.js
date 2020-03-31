import { getStoreList, storesActionCreators } from './entities/stores';
import Url from '../../../utils/url';

import { get } from '../../../utils/request';

const initialState = {
  paginationInfo: {
    page: 0,
    pageSize: 5,
    hasMore: true,
  },
  storeIds: [],
  searchingStoreList: [],
};

const types = {
  // fetch store list
  GET_STORE_LIST_REQUEST: 'SITE/HOME/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/HOME/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/HOME/GET_STORE_LIST_FAILURE',

  // fetch searching store list
  GET_SEARCHING_STORE_LIST_REQUEST: 'SITE/HOME/GET_SEARCHING_STORE_LIST_REQUEST',
  GET_SEARCHING_STORE_LIST_SUCCESS: 'SITE/HOME/GET_SEARCHING_STORE_LIST_SUCCESS',
  GET_SEARCHING_STORE_LIST_FAILURE: 'SITE/HOME/GET_SEARCHING_STORE_LIST_FAILURE',
};

const fetchStoreList = ({ coords, page, pageSize }) => (dispatch, getState) => {
  return dispatch({
    types: [types.GET_STORE_LIST_REQUEST, types.GET_STORE_LIST_SUCCESS, types.GET_STORE_LIST_FAILURE],
    requestPromise: get(
      `${Url.API_URLS.GET_STORE_LIST.url}?lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}`
    ).then(async response => {
      if (response && response.stores) {
        await dispatch(storesActionCreators.saveStores(response.stores));
      }
      return response;
    }),
  });
};

const fetchSearchingStoreList = ({ coords, keyword, top }) => ({
  types: [
    types.GET_SEARCHING_STORE_LIST_REQUEST,
    types.GET_SEARCHING_STORE_LIST_SUCCESS,
    types.GET_SEARCHING_STORE_LIST_FAILURE,
  ],
  requestPromise: get(
    `${Url.API_URLS.GET_SEARCHING_STORE_LIST.url}?keyword=${keyword}&lat=${coords.lat}&lng=${coords.lng}&top=${top}`
  ),
});

// @actions
const actions = {
  getStoreList: ({ coords, page, pageSize }) => async (dispatch, getState) => {
    return await dispatch(fetchStoreList({ coords, page, pageSize }));
  },

  getSearchingStoreList: ({ coords, keyword }) => async (dispatch, getState) => {
    return dispatch(fetchSearchingStoreList({ coords, keyword, top: 5 }));
  },
};

// @reducers
const storeIdsReducer = (state, action) => {
  if (action.type === types.GET_STORE_LIST_SUCCESS) {
    const { response } = action;
    return { ...state, storeIds: state.storeIds.concat((response.stores || []).map(store => store.id)) };
  }

  return state;
};

const paginationInfoReducer = (state, action) => {
  switch (action.type) {
    case types.GET_STORE_LIST_SUCCESS:
      const { stores } = action.response;
      const { page, pageSize } = state.paginationInfo;

      if (!stores || !stores.length) {
        return { ...state, hasMore: false, page, pageSize };
      }

      return {
        ...state,
        page: page + 1,
        pageSize,
      };
    case types.GET_STORE_LIST_FAILURE:
      return { ...state, hasMore: false };
    default:
      return state;
  }
};

const reducer = (state = initialState, action) => {
  const { response } = action;

  switch (action.type) {
    case types.GET_STORE_LIST_SUCCESS:
    case types.GET_STORE_LIST_FAILURE:
      return {
        ...state,
        storeIds: storeIdsReducer(state.storeIds, action),
        paginationInfo: paginationInfoReducer(state.paginationInfo, action),
      };
    case types.GET_SEARCHING_STORE_LIST_SUCCESS:
      const { stores: searchingStoreList } = response;

      return {
        ...state,
        searchingStoreList,
      };
    default:
      return state;
  }
};

export const homeActionCreators = actions;
export default reducer;

// @selectors
export const getPaginationInfo = state => state.home.paginationInfo;
export const getSearchingStores = state => state.home.searchingStoreList;
export const getAllCurrentStores = state => getStoreList(state);
