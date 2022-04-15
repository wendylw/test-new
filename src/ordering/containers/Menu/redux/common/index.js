import { createSlice } from '@reduxjs/toolkit';
import {
  selectCategory,
  showSearchingBox,
  hideSearchingBox,
  updateSearchingKeyword,
  clearSearchingKeyword,
  setBeforeStartToSearchScrollTopPosition,
  clearBeforeStartToSearchScrollTopPosition,
  updateStatusVirtualKeyboard,
} from './thunks';

const initialState = {
  activeCategoryId: null,
  storeNameInView: true,
  categoriesInView: {},
  searchingBannerVisible: false,
  searchingProductKeywords: '',
  beforeStartToSearchScrollTopPosition: 0,
  virtualKeyboardVisible: false,
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/common',
  initialState,
  reducers: {
    setStoreNameInView: (state, { payload }) => {
      state.storeNameInView = payload;
    },
    setCategoriesInView: (state, { payload: { categoryId, inView } }) => {
      state.categoriesInView[categoryId] = inView;
      state.activeCategoryId = null;
    },
  },
  extraReducers: {
    [selectCategory.fulfilled.type]: (state, { payload }) => {
      state.activeCategoryId = payload;
    },
    [showSearchingBox.fulfilled.type]: state => {
      state.searchingBannerVisible = true;
    },
    [hideSearchingBox.fulfilled.type]: state => {
      state.searchingBannerVisible = false;
    },
    [updateSearchingKeyword.fulfilled.type]: (state, { payload }) => {
      state.searchingProductKeywords = payload;
    },
    [clearSearchingKeyword.fulfilled.type]: state => {
      state.searchingProductKeywords = initialState.searchingProductKeywords;
    },
    [setBeforeStartToSearchScrollTopPosition.fulfilled.type]: (state, { payload }) => {
      state.beforeStartToSearchScrollTopPosition = payload;
    },
    [clearBeforeStartToSearchScrollTopPosition.fulfilled.type]: state => {
      state.beforeStartToSearchScrollTopPosition = 0;
    },
    [updateStatusVirtualKeyboard.fulfilled.type]: (state, { payload }) => {
      state.virtualKeyboardVisible = payload;
    },
  },
});

export default reducer;
