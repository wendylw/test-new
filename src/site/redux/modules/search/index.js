import { createSlice } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _concat from 'lodash/concat';
import {
  setPageInfo,
  resetPageInfo,
  setShippingType,
  resetShippingType,
  loadStoreList,
  resetStoreList,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const defaultPageInfo = {
  page: 0,
  pageSize: 10,
  hasMore: true,
  loading: false,
  scrollTop: 0,
};

const defaultSearchInfo = {
  keyword: '',
  results: [],
};

const initialState = {
  storeListInfo: {
    data: {
      storeIds: [],
    },
    status: null,
    error: null,
  },
  pageInfo: {
    data: defaultPageInfo,
    status: null,
    error: null,
  },
  searchInfo: {
    data: {
      keyword: '',
      results: [],
    },
  },
  shippingType: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'site/search',
  initialState,
  reducers: {
    setSearchInfo(state, action) {
      const prevData = state.searchInfo.data;
      state.searchInfo.data = { ...prevData, ...action.payload };
    },
    resetSearchInfo(state) {
      state.searchInfo.data = defaultSearchInfo;
    },
  },
  extraReducers: {
    [loadStoreList.pending.type]: state => {
      const { page } = state.pageInfo.data;
      const { storeIds } = state.storeListInfo.data;

      state.storeListInfo.data.storeIds = page === 0 ? [] : storeIds;
      state.searchInfo.data.results = [];

      state.storeListInfo.status = API_REQUEST_STATUS.PENDING;
      state.storeListInfo.error = null;
    },
    [loadStoreList.fulfilled.type]: (state, action) => {
      const { storeIds } = state.storeListInfo.data;
      const { page, pageSize, hasMore } = state.pageInfo.data;

      if (action.payload) {
        const stores = _get(action.payload, 'stores', []);
        const nextStoreIds = stores.map(store => store.id);

        state.storeListInfo.data.storeIds = _concat(storeIds, nextStoreIds);
        state.pageInfo.data.page = page + 1;
        state.pageInfo.data.hasMore = _isEmpty(stores) || pageSize > stores.length ? false : hasMore;
        state.pageInfo.data.loading = false;
        state.searchInfo.data.results = nextStoreIds;
      }

      state.storeListInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.storeListInfo.error = null;
    },
    [loadStoreList.rejected.type]: (state, action) => {
      state.pageInfo.data.hasMore = false;
      state.pageInfo.data.loading = false;
      state.storeListInfo.status = API_REQUEST_STATUS.REJECTED;
      state.storeListInfo.error = action.error;
    },
    [resetStoreList.pending.type]: state => {
      state.storeListInfo.status = API_REQUEST_STATUS.PENDING;
      state.storeListInfo.error = null;
    },
    [resetStoreList.fulfilled.type]: state => {
      state.storeListInfo.data.storeIds = [];
      state.storeListInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.storeListInfo.error = null;
    },
    [resetStoreList.rejected.type]: (state, action) => {
      state.storeListInfo.status = API_REQUEST_STATUS.REJECTED;
      state.storeListInfo.error = action.error;
    },
    [setPageInfo.pending.type]: state => {
      state.pageInfo.status = API_REQUEST_STATUS.PENDING;
      state.pageInfo.error = null;
    },
    [setPageInfo.fulfilled.type]: (state, action) => {
      state.pageInfo.data = action.payload;
      state.pageInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.pageInfo.error = null;
    },
    [setPageInfo.rejected.type]: (state, action) => {
      state.pageInfo.status = API_REQUEST_STATUS.REJECTED;
      state.pageInfo.error = action.error;
    },
    [resetPageInfo.pending.type]: state => {
      state.pageInfo.status = API_REQUEST_STATUS.PENDING;
      state.pageInfo.error = null;
    },
    [resetPageInfo.fulfilled.type]: state => {
      state.pageInfo.data = defaultPageInfo;
      state.pageInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.pageInfo.error = null;
    },
    [resetPageInfo.rejected.type]: (state, action) => {
      state.pageInfo.status = API_REQUEST_STATUS.REJECTED;
      state.pageInfo.error = action.error;
    },
    [setShippingType.pending.type]: state => {
      state.shippingType.status = API_REQUEST_STATUS.PENDING;
      state.shippingType.error = null;
    },
    [setShippingType.fulfilled.type]: (state, action) => {
      state.shippingType.data = action.payload;
      state.shippingType.status = API_REQUEST_STATUS.FULFILLED;
      state.shippingType.error = null;
    },
    [setShippingType.rejected.type]: (state, action) => {
      state.shippingType.status = API_REQUEST_STATUS.REJECTED;
      state.shippingType.error = action.error;
    },
    [resetShippingType.pending.type]: state => {
      state.shippingType.status = API_REQUEST_STATUS.PENDING;
      state.shippingType.error = null;
    },
    [resetShippingType.fulfilled.type]: state => {
      state.shippingType.data = null;
      state.shippingType.status = API_REQUEST_STATUS.FULFILLED;
      state.shippingType.error = null;
    },
    [resetShippingType.rejected.type]: (state, action) => {
      state.shippingType.status = API_REQUEST_STATUS.REJECTED;
      state.shippingType.error = action.error;
    },
  },
});

export default reducer;
