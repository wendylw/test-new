import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import {
  selectCategory,
  showSearchingBox,
  hideSearchingBox,
  updateSearchingKeyword,
  clearSearchingKeyword,
  setBeforeStartToSearchScrollTopPosition,
  clearBeforeStartToSearchScrollTopPosition,
  updateStatusVirtualKeyboard,
  updateCurrentTime,
  updateExpectedDeliveryDate,
  toggleUserSaveStoreStatus,
  loadUserFavStoreStatus,
  showStoreInfoDrawer,
  hideStoreInfoDrawer,
  showLocationDrawer,
  hideLocationDrawer,
  showTimeSlotDrawer,
  hideTimeSlotDrawer,
  showStoreListDrawer,
  hideStoreListDrawer,
  noThanksButtonClicked,
  addAddressButtonClicked,
  showLocationConfirmModal,
  hideLocationConfirmModal,
  saveSelectedProductItemInfo,
  clearSelectedProductItemInfo,
} from './thunks';

const initialState = {
  activeCategoryId: null,
  storeNameInView: true,
  categoriesInView: {},
  searchingBannerVisible: false,
  searchingProductKeywords: '',
  beforeStartToSearchScrollTopPosition: 0,
  virtualKeyboardVisible: false,
  // For now, currentTime only will be updated when menu page mounted
  // TODO: Need to further consideration currentTime updated strategy
  currentTime: new Date().toISOString(),
  // User selected expected delivery time: "2022-06-01T01:00:00.000Z" | "now"
  expectedDeliveryTime: null,
  storeFavStatus: {
    data: false,
    status: null,
    error: null,
  },
  storeInfoDrawerVisible: false,
  locationDrawerVisible: false,
  storeListDrawerVisible: false,
  enabledDeliveryRevamp: process.env.REACT_APP_ENABLED_DELIVERY_REVAMP === 'true',
  timeSlotDrawerVisible: false,
  locationConfirmModalVisible: false,
  selectedProductItemInfo: null,
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
    [updateCurrentTime.fulfilled.type]: state => {
      state.currentTime = new Date().toISOString();
    },
    [updateExpectedDeliveryDate.fulfilled.type]: (state, { payload }) => {
      state.expectedDeliveryTime = payload;
    },
    [loadUserFavStoreStatus.pending.type]: state => {
      state.storeFavStatus.status = API_REQUEST_STATUS.PENDING;
      state.storeFavStatus.error = null;
    },
    [loadUserFavStoreStatus.fulfilled.type]: (state, { payload }) => {
      state.storeFavStatus.status = API_REQUEST_STATUS.FULFILLED;
      state.storeFavStatus.data = payload;
    },
    [loadUserFavStoreStatus.rejected.type]: (state, { error }) => {
      state.storeFavStatus.status = API_REQUEST_STATUS.REJECTED;
      state.storeFavStatus.error = error;
    },
    [toggleUserSaveStoreStatus.pending.type]: state => {
      state.storeFavStatus.status = API_REQUEST_STATUS.PENDING;
      state.storeFavStatus.error = null;
    },
    [toggleUserSaveStoreStatus.fulfilled.type]: (state, { payload }) => {
      state.storeFavStatus.status = API_REQUEST_STATUS.FULFILLED;
      state.storeFavStatus.data = payload;
    },
    [toggleUserSaveStoreStatus.rejected.type]: (state, { error }) => {
      state.storeFavStatus.status = API_REQUEST_STATUS.REJECTED;
      state.storeFavStatus.error = error;
    },
    [showStoreInfoDrawer.fulfilled.type]: state => {
      state.storeInfoDrawerVisible = true;
    },
    [hideStoreInfoDrawer.fulfilled.type]: state => {
      state.storeInfoDrawerVisible = false;
    },
    [showLocationDrawer.fulfilled.type]: state => {
      state.locationDrawerVisible = true;
    },
    [hideLocationDrawer.fulfilled.type]: state => {
      state.locationDrawerVisible = false;
    },
    [showTimeSlotDrawer.fulfilled.type]: state => {
      state.timeSlotDrawerVisible = true;
    },
    [hideTimeSlotDrawer.fulfilled.type]: state => {
      state.timeSlotDrawerVisible = false;
    },
    [showStoreListDrawer.fulfilled.type]: state => {
      state.storeListDrawerVisible = true;
    },
    [hideStoreListDrawer.fulfilled.type]: state => {
      state.storeListDrawerVisible = false;
    },
    [showLocationConfirmModal.fulfilled.type]: state => {
      state.locationConfirmModalVisible = true;
    },
    [hideLocationConfirmModal.fulfilled.type]: state => {
      state.locationConfirmModalVisible = false;
    },
    [addAddressButtonClicked.fulfilled.type]: state => {
      state.locationConfirmModalVisible = false;
      state.locationDrawerVisible = true;
    },
    [noThanksButtonClicked.fulfilled.type]: state => {
      state.locationConfirmModalVisible = false;
      state.selectedProductItemInfo = null;
    },
    [saveSelectedProductItemInfo.fulfilled.type]: (state, { payload }) => {
      const { productId, categoryId } = payload;
      state.selectedProductItemInfo = { productId, categoryId };
    },
    [clearSelectedProductItemInfo.fulfilled.type]: state => {
      state.selectedProductItemInfo = null;
    },
  },
});

export default reducer;
