const initialState = {
  pageInfo: {
    page: 0,
    pageSize: 5,
  },
  storeIds: [],
};

const types = {
  GET_STORE_LIST_REQUEST: 'SITE/HOME/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/HOME/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/HOME/GET_STORE_LIST_FAILURE',
};

const ajaxRequestBusiness = ({ lat, lng, page, pageSize }) => ({
  [API_REQUEST]: {
    types: [types.GET_STORE_LIST_REQUEST, types.GET_STORE_LIST_SUCCESS, types.GET_STORE_LIST_FAILURE],
    ...Url.API_URLS.GET_STORE_LIST,
    params: { lat, lng, page, pageSize },
  },
});

// @actions
const actions = {
  getStoreList: pageInfo => (dispatch, getState) => {},
};

// @reducers

const reducer = (state = initialState, action) => {};

export const homeActionCreators = actions;
export default reducer;

// @selectors
export const getPageInfo = state => getPlaceById(state, state.home.pageInfo);
