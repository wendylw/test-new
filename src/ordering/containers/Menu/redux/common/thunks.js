import _get from 'lodash/get';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push, replace } from 'connected-react-router';
import {
  actions as appActions,
  getBusinessUTCOffset,
  getIsBeepDeliveryShippingType,
  getIsCoreStoresLoaded,
  getStoreId,
  getStoreInfoForCleverTap,
  getPaymentInfoForCleverTap,
  getTableId,
  getUserConsumerId,
  getUserIsLogin,
  getMerchantCountry,
  getFreeShippingMinAmount,
  getCashbackRate,
  getLocationSearch,
  getIsWebview,
  getIsTNGMiniProgram,
  getIsInBrowser,
  getIsInAppOrMiniProgram,
  getURLQueryObject,
  getStoreSupportShippingTypes,
  getFoodTagsForCleverTap,
  getCoreBusinessAPIErrorCategory,
  getCoreStoresErrorCategory,
  getIsCoreBusinessRequestRejected,
  getIsCoreStoresRequestRejected,
  getIsOnlineCategoryRequestRejected,
  getOnlineCategoryErrorCategory,
  getIsGetCartFailed,
  getCartErrorCategory,
  getloginAppErrorCategory,
} from '../../../../redux/modules/app';
import {
  getIsProductListReady,
  getIsEnablePayLater,
  getIsStoreInfoReady,
  getCurrentTime,
  getStore,
  getShippingType,
  getIsQrOrderingShippingType,
  getHasUserSaveStore,
  getIsAddressOutOfRange,
  getHasSelectedExpectedDeliveryTime,
  getStoreStatus,
  getHasSelectedProductItemInfo,
} from './selectors';
import { queryCartAndStatus, clearQueryCartStatus } from '../../../../redux/modules/cart/thunks';
import { PATH_NAME_MAPPING, SHIPPING_TYPES, SOURCE_TYPE } from '../../../../../common/utils/constants';
import {
  getExpectedDeliveryDateFromSession,
  getFilteredQueryString,
  getShippingTypeFromUrl,
  getSourceUrlFromSessionStorage,
  isDineInType,
  removeExpectedDeliveryTime,
  setSessionVariable,
} from '../../../../../common/utils';
import Clevertap from '../../../../../utils/clevertap';
import * as StoreUtils from '../../../../../utils/store-utils';
import * as TimeLib from '../../../../../utils/time-lib';
import * as NativeMethods from '../../../../../utils/native-methods';
import { fetchStoreFavStatus, saveStoreFavStatus, updateStoreInfoCookies } from './api-request';
import { shortenUrl } from '../../../../../utils/shortenUrl';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
import { getShareLinkUrl } from '../../utils';
import { hideMiniCartDrawer, showMiniCartDrawer } from '../cart/thunks';
import { getIfAddressInfoExists } from '../../../../../redux/modules/address/selectors';
import { resetAddressListStatus } from '../../../../redux/modules/addressList/thunks';
import { getStoreById } from '../../../../../redux/modules/entities/stores';
import { STORE_OPENING_STATUS } from '../../constants';
import ApiFetchError from '../../../../../utils/api/api-fetch-error';

const ensureTableId = state => {
  const tableId = getTableId(state);
  const storeId = getStoreId(state);

  if (storeId) {
    if (!tableId) {
      window.location.href = `${PATH_NAME_MAPPING.DINE}?s=${storeId}&from=home`;
    }
  } else {
    window.location.href = PATH_NAME_MAPPING.DINE;
  }
};

const ensureShippingType = () => {
  const shippingType = getShippingTypeFromUrl();
  const validShippingTypes = new Set(Object.values(SHIPPING_TYPES));
  if (!validShippingTypes.has(shippingType)) {
    window.location.href = window.location.origin;
  }
};

export const showStoreInfoDrawer = createAsyncThunk('ordering/menu/common/showStoreInfoDrawer', async () => {});

// FB-4011: We need to save the user's current selected product item information to the redux store. This data is used for:
// 1. As one of the conditions to re-dispatch showProductDetailDrawer thunk when possible
// 2. As a request payload to fetch product details before showing the product detail drawer
export const saveSelectedProductItemInfo = createAsyncThunk(
  'ordering/menu/common/saveSelectedProductItemInfo',
  async itemInfo => itemInfo
);

// FB-4011: We need to clear the user's current selected product item information from the redux store.
// Once the user dismisses our modal/drawers during the new workflow journey, we will clear this information to avoid popping up the product detail drawer at the wrong time.
export const clearSelectedProductItemInfo = createAsyncThunk(
  'ordering/menu/common/clearSelectedProductItemInfo',
  async () => {}
);

export const cleanUpSelectedProductItemInfoIfNeeded = createAsyncThunk(
  'ordering/menu/common/cleanUpSelectedProductItemInfoIfNeeded',
  async (_, { dispatch, getState }) => {
    const hasSelectedProductItemInfo = getHasSelectedProductItemInfo(getState());

    if (hasSelectedProductItemInfo) {
      dispatch(clearSelectedProductItemInfo());
    }
  }
);

export const showLocationDrawer = createAsyncThunk('ordering/menu/common/showLocationDrawer', () => {});

export const hideLocationDrawer = createAsyncThunk('ordering/menu/common/hideLocationDrawer', () => {});

export const locationDrawerOpened = createAsyncThunk(
  'ordering/menu/common/locationDrawerOpened',
  async (_, { getState, dispatch }) => {
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Menu page - Click delivery location', storeInfoForCleverTap);
    await dispatch(showLocationDrawer());
  }
);

export const locationDrawerClosed = createAsyncThunk(
  'ordering/menu/common/locationDrawerClosed',
  async (_, { dispatch }) => {
    Clevertap.pushEvent('Location Page - Click back');
    await dispatch(cleanUpSelectedProductItemInfoIfNeeded());
    await dispatch(hideLocationDrawer());
  }
);

/**
 * @params expectedDate: null | ISO string format | now
 */
export const updateExpectedDeliveryDate = createAsyncThunk(
  'ordering/menu/common/updateExpectedDeliveryDate',
  async ({ expectedDate, shippingType }, { getState }) => {
    try {
      const currentTime = getCurrentTime(getState());
      const store = getStore(getState());
      const businessUTCOffset = getBusinessUTCOffset(getState());
      const currentDayJsObj = StoreUtils.getBusinessDateTime(businessUTCOffset, currentTime);

      if (!expectedDate) {
        removeExpectedDeliveryTime();
        return null;
      }

      // Immediate delivery time
      if (expectedDate === 'now') {
        const isOpen = StoreUtils.isAvailableOnDemandOrderTime(
          store,
          currentDayJsObj.toDate(),
          businessUTCOffset,
          shippingType
        );
        const currentTimeStartOfDay = currentDayJsObj.startOf('day').toISOString();

        setSessionVariable(
          'expectedDeliveryDate',
          JSON.stringify({
            date: currentTimeStartOfDay,
            isOpen,
            isToday: true,
          })
        );
        const expectedDeliveryHour =
          shippingType === SHIPPING_TYPES.DELIVERY ? { from: 'now', to: 'now' } : { from: 'now' };

        setSessionVariable('expectedDeliveryHour', JSON.stringify(expectedDeliveryHour));

        return 'now';
      }

      const expectedDateDayJsObj = StoreUtils.getBusinessDateTime(businessUTCOffset, expectedDate);

      const isToday = currentDayJsObj.isSame(expectedDateDayJsObj, 'day');

      const isOpen = StoreUtils.isAvailableOrderTime(
        store,
        expectedDateDayJsObj.toDate(),
        businessUTCOffset,
        shippingType
      );

      setSessionVariable(
        'expectedDeliveryDate',
        JSON.stringify({
          date: expectedDateDayJsObj.startOf('day').toISOString(),
          isOpen,
          isToday,
        })
      );

      const from = TimeLib.getTimeFromDayjs(expectedDateDayJsObj);

      const to = shippingType === SHIPPING_TYPES.DELIVERY ? TimeLib.add(from, { value: 1, unit: 'hour' }) : undefined;

      setSessionVariable(
        'expectedDeliveryHour',
        JSON.stringify({
          from,
          to,
        })
      );

      return expectedDateDayJsObj.toISOString();
    } catch (error) {
      console.error('Ordering Menu updateExpectedDeliveryDate', error?.message || '');

      throw error;
    }
  }
);

export const initExpectedDeliveryDate = createAsyncThunk(
  'ordering/menu/common/initExpectedDeliveryDate',
  async (_, { getState, dispatch }) => {
    try {
      const { date, hour: expectedDeliveryHour } = getExpectedDeliveryDateFromSession();
      const expectedDeliveryDate = date.date;
      const from = expectedDeliveryHour?.from || null;
      const to = expectedDeliveryHour?.to || null;
      const businessUTCOffset = getBusinessUTCOffset(getState());
      const shippingType = getShippingType(getState());
      const currentTime = getCurrentTime(getState());
      const store = getStore(getState());

      let initialExpectedDeliveryTime = (() => {
        if (!expectedDeliveryDate || !from || !store) {
          return null;
        }

        const { enablePreOrder, disableTodayDeliveryPreOrder, disableTodayPreOrder } = store.qrOrderingSettings;

        // PICKUP only has [from], no [to]
        const previousShippingType = from && !to ? SHIPPING_TYPES.PICKUP : SHIPPING_TYPES.DELIVERY;

        // Remove user previously selected delivery/pickup time from session
        if (shippingType !== previousShippingType) {
          return null;
        }

        if (from === 'now') {
          const isAvailableOnDemandOrder = StoreUtils.isAvailableOnDemandOrderTime(
            store,
            new Date(currentTime),
            businessUTCOffset,
            shippingType
          );
          if (!isAvailableOnDemandOrder) {
            return null;
          }

          return 'now';
        }

        const expectedDeliveryDateDayjsObj = StoreUtils.getBusinessDateTime(
          businessUTCOffset,
          new Date(expectedDeliveryDate)
        );

        const expectedDeliveryTimeDayjsObj = TimeLib.setDateTime(from, expectedDeliveryDateDayjsObj);

        // expected delivery time is out of date
        if (expectedDeliveryTimeDayjsObj.isBefore(currentTime)) {
          return null;
        }

        // store is disable pre-order
        if (
          !enablePreOrder ||
          disableTodayPreOrder ||
          (shippingType === SHIPPING_TYPES.DELIVERY && disableTodayDeliveryPreOrder)
        ) {
          return null;
        }

        if (
          !StoreUtils.isAvailableOrderTime(
            store,
            expectedDeliveryTimeDayjsObj.toDate(),
            businessUTCOffset,
            shippingType
          )
        ) {
          return null;
        }

        return expectedDeliveryTimeDayjsObj.toISOString();
      })();

      // if [initialExpectedDeliveryTime] is null, then check whether able to selected 'now' on default
      if (
        !initialExpectedDeliveryTime &&
        StoreUtils.isAvailableOnDemandOrderTime(store, new Date(currentTime), businessUTCOffset, shippingType)
      ) {
        initialExpectedDeliveryTime = 'now';
      }

      dispatch(
        updateExpectedDeliveryDate({
          expectedDate: initialExpectedDeliveryTime,
          shippingType,
        })
      );
    } catch (error) {
      console.error('Ordering Menu initExpectedDeliveryDate', error?.message || '');
      throw error;
    }
  }
);

export const updateCurrentTime = createAsyncThunk(
  'ordering/menu/common/updateCurrentTime',
  async (currentTime = new Date().toISOString()) => currentTime
);

export const loadUserFavStoreStatus = createAsyncThunk(
  'ordering/menu/common/loadUserFavStoreStatus',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);
    const { isFavorite = false } = await fetchStoreFavStatus({ consumerId, storeId });
    return isFavorite;
  }
);

const initializeForBeepQR = async ({ dispatch, getState }) => {
  const state = getState();
  const storeId = getStoreId(state);
  const isStoreInfoReady = getIsStoreInfoReady(state);

  try {
    if (!isStoreInfoReady) {
      await dispatch(appActions.loadCoreBusiness());
      const isCoreBusinessRequestRejected = getIsCoreBusinessRequestRejected(getState());

      // 40005 and business does not existed should be filtered out from error log
      if (isCoreBusinessRequestRejected) {
        const coreBusinessAPIErrorCategory = getCoreBusinessAPIErrorCategory(getState());
        throw new ApiFetchError('Failed to load core business data', { category: coreBusinessAPIErrorCategory });
      }
    }

    // Get EnablePayLater after core business loaded
    const enablePayLater = getIsEnablePayLater(getState());

    if (storeId) {
      enablePayLater ? dispatch(queryCartAndStatus()) : dispatch(appActions.loadShoppingCart());
    }

    // There must be a log for the error of loadShoppingCart. If there is no cart, the footer of the review cart button will not be displayed.
    const isGetCartFailed = getIsGetCartFailed(getState());

    if (!enablePayLater && isGetCartFailed) {
      const cartErrorCategory = getCartErrorCategory(getState());
      throw new ApiFetchError('Failed to load shopping cart', { category: cartErrorCategory });
    }
  } catch (error) {
    logger.error(
      'Ordering_Menu_InitializeForBeepQRFailed',
      {
        message: error?.message,
      },
      {
        bizFlow: {
          flow: KEY_EVENTS_FLOWS.SELECTION,
          step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.SELECTION].VIEW_PRODUCTS,
        },
        errorCategory: error?.name,
      }
    );

    throw error;
  }
};

const initializeForBeepDelivery = async ({ dispatch, getState }) => {
  const state = getState();
  const isWebview = getIsWebview(state);
  const shippingType = getShippingType(state);
  const isStoreInfoReady = getIsStoreInfoReady(state);
  const isCoreStoresLoaded = getIsCoreStoresLoaded(state);

  const basicLoadDataList = [];

  try {
    if (!isStoreInfoReady) {
      basicLoadDataList.push(dispatch(appActions.loadCoreBusiness()));
    }

    if (!isCoreStoresLoaded) {
      basicLoadDataList.push(dispatch(appActions.loadCoreStores()));
    }

    if (basicLoadDataList.length > 0) {
      await Promise.all(basicLoadDataList);

      const isCoreBusinessRequestRejected = getIsCoreBusinessRequestRejected(getState());
      const isCoreStoresRequestRejected = getIsCoreStoresRequestRejected(getState());

      // 40005 and business does not existed should be filtered out from error log
      if (isCoreBusinessRequestRejected) {
        const coreBusinessAPIErrorCategory = getCoreBusinessAPIErrorCategory(getState());
        throw new ApiFetchError('Failed to load core business data', { category: coreBusinessAPIErrorCategory });
      }

      if (isCoreStoresRequestRejected) {
        const coreStoresErrorCategory = getCoreStoresErrorCategory(getState());
        throw new ApiFetchError('Failed to load core stores data', { category: coreStoresErrorCategory });
      }
    }

    const store = getStore(getState());
    await dispatch(updateCurrentTime());

    if (!store) {
      // remove expectedDeliveryDate
      await dispatch(
        updateExpectedDeliveryDate({
          expectedDate: null,
          shippingType,
        })
      );
      return;
    }

    const storeSupportShippingTypes = getStoreSupportShippingTypes(getState());

    // if store not support current shipping type
    // then update to its support shipping type
    // TODO: For the better UX, should notify user the shippingType has been changed
    if (!storeSupportShippingTypes.includes(shippingType)) {
      await dispatch(appActions.updateShippingType(storeSupportShippingTypes[0]));
    }

    if (isWebview) {
      const shareLinkUrl = getShareLinkUrl();

      shortenUrl(shareLinkUrl).catch(error =>
        logger.error('Ordering_Menu_ShareStoreLinkOnDidMountFailed', { message: error.message })
      );
    }

    const storeStatus = getStoreStatus(getState());

    if (storeStatus === STORE_OPENING_STATUS.CLOSED) {
      // Show store info drawer automatically when store is closed
      await dispatch(showStoreInfoDrawer());
      return;
    }

    await dispatch(initExpectedDeliveryDate());

    dispatch(appActions.loadShoppingCart()).then(() => {
      const query = getURLQueryObject(getState());
      const { source } = query;

      // if there is source='shoppingCart' in query
      // then show mini cart automatically once page mounted
      if (source === SOURCE_TYPE.SHOPPING_CART) {
        dispatch(showMiniCartDrawer());

        const search = getFilteredQueryString('source');

        // remove source='shoppingCart' from query
        dispatch(
          replace({
            pathname: PATH_NAME_MAPPING.ORDERING_HOME,
            search,
          })
        );
      }
    });

    const isAddressOutOfRange = getIsAddressOutOfRange(getState());

    if (isAddressOutOfRange) {
      await dispatch(showLocationDrawer());
    }
  } catch (error) {
    logger.error(
      'Ordering_Menu_InitializeForBeepDeliveryFailed',
      {
        message: error?.message,
      },
      {
        bizFlow: {
          flow: KEY_EVENTS_FLOWS.SELECTION,
          step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.SELECTION].VIEW_PRODUCTS,
        },
        errorCategory: error?.name,
      }
    );

    throw error;
  }
};

/**
 * Ordering Menu page mounted
 */
export const mounted = createAsyncThunk('ordering/menu/common/mounted', async (_, { dispatch, getState }) => {
  // - Redirect to `/dine` page if missing `tableId`
  // - Load Product List
  // - Load user alcohol concept data if needed
  // - Load Core Business Data
  // - Load Store List Data
  // - Init delivery time
  // - Load shopping Cart data & status
  // - CleverTap push event, `Menu Page - View page`

  const state = getState();
  const isBeepQR = getIsQrOrderingShippingType(state);
  const isBeepDelivery = getIsBeepDeliveryShippingType(state);

  try {
    ensureShippingType();

    if (isBeepQR) {
      if (isDineInType()) {
        ensureTableId(state);
      }

      const isProductListReady = getIsProductListReady(getState());

      if (!isProductListReady) {
        dispatch(appActions.loadProductList());
      }

      await initializeForBeepQR({ getState, dispatch });
    }

    if (isBeepDelivery) {
      await initializeForBeepDelivery({ getState, dispatch });

      const isProductListReady = getIsProductListReady(getState());

      if (!isProductListReady) {
        // MUST put loadProductList after the "initializeForBeepDelivery" function
        // Since Load Product List API depend on shippingType, deliveryTime and storeId data
        await dispatch(appActions.loadProductList());
      }
    }

    const isOnlineCategoryRequestFailed = getIsOnlineCategoryRequestRejected(getState());

    const onlineCategoryErrorCategory = getOnlineCategoryErrorCategory(getState());

    if (isOnlineCategoryRequestFailed) {
      logger.error(
        'Ordering_Menu_loadProductListFailed',
        { message: 'Failed to load product list' },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.SELECTION,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.SELECTION].VIEW_PRODUCTS,
          },
          errorCategory: onlineCategoryErrorCategory,
        }
      );
    }

    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const foodTagsForCleverTap = getFoodTagsForCleverTap(getState());

    Clevertap.pushEvent('Menu Page - View page', {
      ...storeInfoForCleverTap,
      foodTags: foodTagsForCleverTap,
    });
  } catch (error) {
    logger.error(
      'Ordering_Menu_LoadPageFailed',
      {
        message: error?.message,
      },
      {
        bizFlow: {
          flow: KEY_EVENTS_FLOWS.SELECTION,
          step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.SELECTION].VIEW_PRODUCTS,
        },
        errorCategory: error?.name,
      }
    );

    throw error;
  }
});

/**
 * Ordering Menu Page willUnmount
 */
export const willUnmount = createAsyncThunk('ordering/menu/common/willUnmount', async (_, { dispatch, getState }) => {
  // clear resources if need

  const state = getState();
  const enablePayLater = getIsEnablePayLater(state);

  if (enablePayLater) {
    await dispatch(clearQueryCartStatus());
  }
});

/**
 * Select a category
 */
export const selectCategory = createAsyncThunk('ordering/menu/common/selectCategory', (categoryId, { getState }) => {
  const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
  Clevertap.pushEvent('Menu Page - Click category', storeInfoForCleverTap);
  return categoryId;
});

/**
 * show searching box
 */
export const showSearchingBox = createAsyncThunk('ordering/menu/common/showSearchingBox', async () => {});

/**
 * hide searching box
 */
export const hideSearchingBox = createAsyncThunk('ordering/menu/common/hideSearchingBox', async () => {});

/**
 * update searching keyword
 */
export const updateSearchingKeyword = createAsyncThunk(
  'ordering/menu/updateSearchingKeyword',
  async searchingProductKeywords => searchingProductKeywords
);

/**
 * clear searching keyword
 */
export const clearSearchingKeyword = createAsyncThunk('ordering/menu/common/clearSearchingKeyword', async () => {});

/**
 * set scrolling top position before starting to search
 */
export const setBeforeStartToSearchScrollTopPosition = createAsyncThunk(
  'ordering/menu/common/setBeforeStartToSearchScrollTopPosition',
  async scrollTopPosition => scrollTopPosition
);

/**
 * clear scrolling top position before starting to search
 */
export const clearBeforeStartToSearchScrollTopPosition = createAsyncThunk(
  'ordering/menu/common/clearBeforeStartToSearchScrollTopPosition',
  async () => {}
);

/**
 * toggle virtual keyboard status
 */
export const updateStatusVirtualKeyboard = createAsyncThunk(
  'ordering/menu/common/updateStatusVirtualKeyboard',
  async status => status
);

// Optimistic update: do not care about the API callback result, just update the status as user expected
export const toggleUserSaveStoreStatus = createAsyncThunk(
  'ordering/menu/common/toggleUserSaveStoreStatus',
  (_, { getState }) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);
    const updatedSaveResult = !getHasUserSaveStore(state);

    saveStoreFavStatus({ consumerId, storeId, isFavorite: updatedSaveResult }).catch(error =>
      logger.error(`Ordering_Menu_UpdateFavStoreSaveStatus`, { message: error?.message })
    );

    return updatedSaveResult;
  }
);

export const goBack = createAsyncThunk('ordering/menu/common/goBack', (_, { dispatch, getState }) => {
  const sourceUrl = getSourceUrlFromSessionStorage();
  const isWebview = getIsWebview(getState());
  // There is source url in session storage, so we can redirect to the source page
  if (sourceUrl) {
    window.location.href = sourceUrl;
    return;
  }

  // Native back to previous page
  if (isWebview) {
    NativeMethods.goBack();

    return;
  }

  dispatch(historyGoBack());
});

export const saveFavoriteStore = createAsyncThunk(
  'ordering/menu/common/saveFavoriteStore',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const merchantCountry = getMerchantCountry(state);
    const freeShippingMinAmount = getFreeShippingMinAmount(state);
    const shippingType = getShippingType(state);
    const hasUserSaveStore = getHasUserSaveStore(state);
    const cashbackRate = getCashbackRate(state);
    const hasUserLoggedIn = getUserIsLogin(state);
    Clevertap.pushEvent('Menu page - Click saved favourite store button', {
      country: merchantCountry,
      'free delivery above': freeShippingMinAmount || 0,
      'shipping type': shippingType,
      action: hasUserSaveStore ? 'unsaved' : 'saved',
      cashback: cashbackRate,
    });

    if (!hasUserLoggedIn) {
      await dispatch(appActions.loginByBeepApp());
      // BEEP-2728: Retrieve the latest login status after loginByBeepApp thunk is completed
      if (!getUserIsLogin(getState())) return;
    }

    dispatch(toggleUserSaveStoreStatus());
  }
);

export const shareStore = createAsyncThunk('ordering/menu/common/shareStore', async (title, { getState }) => {
  const state = getState();
  const merchantCountry = getMerchantCountry(state);
  const freeShippingMinAmount = getFreeShippingMinAmount(state);
  const shippingType = getShippingType(state);
  const cashbackRate = getCashbackRate(state);
  try {
    const shareLinkUrl = getShareLinkUrl();

    // eslint-disable-next-line camelcase
    const { url_short } = await shortenUrl(shareLinkUrl);

    const para = {
      // eslint-disable-next-line camelcase
      link: `${url_short}`,
      title,
    };
    NativeMethods.shareLink(para);

    Clevertap.pushEvent('Menu page - Click share store link', {
      country: merchantCountry,
      'free delivery above': freeShippingMinAmount || 0,
      'shipping type': shippingType,
      cashback: cashbackRate,
    });
  } catch (error) {
    logger.error('Ordering_Menu_ShareStoreLinkOnClickFailed', { message: error.message });
    throw error;
  }
});

export const hideStoreInfoDrawer = createAsyncThunk('ordering/menu/common/hideStoreInfoDrawer', async () => {});

export const showTimeSlotDrawer = createAsyncThunk('ordering/menu/common/showTimeSlotDrawer', () => {});

export const hideTimeSlotDrawer = createAsyncThunk('ordering/menu/common/hideTimeSlotDrawer', () => {});

export const timeSlotDrawerOpened = createAsyncThunk(
  'ordering/menu/common/timeSlotDrawerOpened',
  async (_, { getState, dispatch }) => {
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Menu page - Click timeslot', storeInfoForCleverTap);
    await dispatch(showTimeSlotDrawer());
  }
);

export const timeSlotDrawerClosed = createAsyncThunk(
  'ordering/menu/common/timeSlotDrawerClosed',
  async (_, { dispatch }) => {
    Clevertap.pushEvent('Timeslot - back');
    await dispatch(cleanUpSelectedProductItemInfoIfNeeded());
    await dispatch(hideTimeSlotDrawer());
  }
);

export const showStoreListDrawer = createAsyncThunk('ordering/menu/common/showStoreListDrawer', () => {});

export const hideStoreListDrawer = createAsyncThunk('ordering/menu/common/hideStoreListDrawer', () => {});

export const storeListDrawerOpened = createAsyncThunk(
  'ordering/menu/common/storeListDrawerOpened',
  async (_, { getState, dispatch }) => {
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Menu page - Click store list', storeInfoForCleverTap);
    await dispatch(showStoreListDrawer());
  }
);

export const storeListDrawerClosed = createAsyncThunk(
  'ordering/menu/common/StoreListDrawerClosed',
  async (_, { dispatch }) => {
    Clevertap.pushEvent('Store List - Back');
    await dispatch(cleanUpSelectedProductItemInfoIfNeeded());
    await dispatch(hideStoreListDrawer());
  }
);

export const showLocationConfirmModal = createAsyncThunk('ordering/menu/common/showLocationConfirmModal', () => {});

export const hideLocationConfirmModal = createAsyncThunk('ordering/menu/common/hideLocationConfirmModal', () => {});

export const addAddressButtonClicked = createAsyncThunk(
  'ordering/menu/common/addAddressButtonClicked',
  async (_, { getState }) => {
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    Clevertap.pushEvent('Menu Page - Location Needed Pop-up - Add address', storeInfoForCleverTap);
  }
);

export const noThanksButtonClicked = createAsyncThunk(
  'ordering/menu/common/noThanksButtonClicked',
  async (_, { getState }) => {
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    Clevertap.pushEvent('Menu page - Location Needed Pop-up - No thanks', storeInfoForCleverTap);
  }
);

export const locationConfirmModalShown = createAsyncThunk(
  'ordering/menu/common/locationConfirmModalShown',
  async (_, { getState }) => {
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    Clevertap.pushEvent('Menu page - Location Needed Pop-up - View Page', storeInfoForCleverTap);
  }
);

export const locationConfirmModalHidden = createAsyncThunk('ordering/menu/common/locationDrawerHidden', async () => {});

/**
 * goto Review cart page
 */
export const reviewCart = createAsyncThunk('ordering/menu/common/reviewCart', async (_, { dispatch, getState }) => {
  dispatch(hideMiniCartDrawer());

  const state = getState();
  const isWebview = getIsWebview(state);
  const isTNGMiniProgram = getIsTNGMiniProgram(state);
  const isInBrowser = getIsInBrowser(state);
  const isInAppOrMiniProgram = getIsInAppOrMiniProgram(state);
  const isLogin = getUserIsLogin(state);
  const shippingType = getShippingType(state);
  const isBeepDelivery = getIsBeepDeliveryShippingType(state);
  const hasSelectedExpectedDeliveryTime = getHasSelectedExpectedDeliveryTime(state);
  const ifAddressInfoExists = getIfAddressInfoExists(getState());
  const paymentInfoForCleverTap = getPaymentInfoForCleverTap(state);
  const storeInfoForCleverTap = getStoreInfoForCleverTap(state);
  const search = getLocationSearch(state);

  Clevertap.pushEvent('Menu page - Click Review cart', {
    ...storeInfoForCleverTap,
    ...paymentInfoForCleverTap,
  });

  if (shippingType === SHIPPING_TYPES.DELIVERY && !ifAddressInfoExists) {
    await dispatch(showLocationDrawer());
    return;
  }

  if (isBeepDelivery && !hasSelectedExpectedDeliveryTime) {
    await dispatch(showTimeSlotDrawer());
    return;
  }

  const gotoReviewCartPage = () => {
    dispatch(push(`${PATH_NAME_MAPPING.ORDERING_CART}${search}`));
  };

  if (isInBrowser || (isInAppOrMiniProgram && isLogin)) {
    gotoReviewCartPage();
    return;
  }

  // Force a login for Beep app & Beep TnG MP
  if (isTNGMiniProgram) {
    await dispatch(appActions.loginByTngMiniProgram());
  }

  if (isWebview) {
    await dispatch(appActions.loginByBeepApp());
  }

  const isUserLogin = getUserIsLogin(getState());

  if (isUserLogin) {
    gotoReviewCartPage();
    return;
  }

  // WB-4690: If users are unable to log in, then they will be stuck on the menu page.
  // We need to log this failure event for further troubleshooting.
  // NOTE: We probably will change the way how we log this event by the login refactor
  const loginAppErrorCategory = getloginAppErrorCategory(getState());
  logger.error(
    'Ordering_Menu_ReviewCartFailed',
    {
      // NOTE: It is safe to record all non-app users as TnG MP users since we only 3 types of clients for now
      message: `Failed to log into ${isWebview ? 'Beep app' : 'TnG mini program'}`,
    },
    {
      bizFlow: {
        flow: KEY_EVENTS_FLOWS.LOGIN,
        step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.LOGIN].SIGN_INTO_APP,
      },
      errorCategory: loginAppErrorCategory,
    }
  );
});

export const changeStore = createAsyncThunk(
  'ordering/menu/common/changeStore',
  async (storeId, { dispatch, getState }) => {
    const state = getState();
    const store = getStoreById(state, storeId);
    const h = _get(store, 'hash', null);

    try {
      await updateStoreInfoCookies(h);

      // NOTE: We need to reset api status to force the api to be called again.
      dispatch(appActions.resetOnlineCategoryStatus());
      dispatch(appActions.resetCoreBusinessStatus());

      // Update store id in both redux and url query
      dispatch(appActions.updateStoreId(storeId));

      if (getUserIsLogin(state)) {
        await dispatch(resetAddressListStatus());
      }
    } catch (e) {
      logger.error('Ordering_Menu_ChangeStoreFailed', { message: e?.message });
      throw e;
    }
  }
);
