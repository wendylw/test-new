import { createSlice } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _concat from 'lodash/concat';
import { resetPageInfo, setShippingType, loadStoreList } from './thunks';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

const defaultPageInfo = {
  page: 0,
  pageSize: 10,
  hasMore: true,
  loading: false,
  scrollTop: 0,
  id: '',
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
  shippingType: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'site/collections',
  initialState,
  reducers: {
    setPageInfo: (state, action) => {
      const { scrollTop } = action.payload;
      state.storeListInfo.data.pageInfo = { ...state.pageInfo.data, scrollTop };
    },
    resetShippingType: state => {
      state.shippingType.data = null;
    },
    resetStoreListInfo: state => {
      state.storeListInfo.data.storeIds = [];
    },
  },
  extraReducers: {
    [loadStoreList.pending.type]: state => {
      const { storeIds } = state.storeListInfo.data;
      const { page, hasMore } = state.pageInfo.data;

      state.storeListInfo.data.storeIds = page === 0 ? [] : storeIds;
      state.pageInfo.data.hasMore = page === 0 ? true : hasMore;
      state.pageInfo.data.loading = true;

      state.storeListInfo.status = API_REQUEST_STATUS.PENDING;
      state.storeListInfo.error = null;
    },
    [loadStoreList.fulfilled.type]: (state, action) => {
      const { storeIds } = state.storeListInfo.data;
      const { page, pageSize, hasMore } = state.pageInfo.data;
      const stores = _get(action.payload, 'stores', []);

      state.storeListInfo.data.storeIds = _concat(
        storeIds,
        stores.map(store => store.id)
      );
      state.pageInfo.data.page = page + 1;
      state.pageInfo.data.hasMore = _isEmpty(stores) || pageSize > stores.length ? false : hasMore;
      state.pageInfo.data.loading = false;

      state.storeListInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.storeListInfo.error = null;
    },
    [loadStoreList.rejected.type]: (state, action) => {
      state.pageInfo.data.hasMore = false;
      state.pageInfo.data.loading = false;
      state.storeListInfo.status = API_REQUEST_STATUS.REJECTED;
      state.storeListInfo.error = action.error;
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
  },
});

export default reducer;
