import _get from 'lodash/get';
import { createAsyncThunk } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { get, post, put } from '../../../../../../utils/api/api-fetch';
import { getCookieVariable, removeCookieVariable } from '../../../../../../common/utils';
import { alert } from '../../../../../../common/feedback';
import { API_INFO, postFoodCourtIdHashCode } from '../../../redux/api-info';
import Constants from '../../../../../../utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import * as NativeMethods from '../../../../../../utils/native-methods';
import { getPaidToCurrentEventDurationMinutes, getIsProfileMissingSkippedExpired } from '../utils';
import { PROFILE_DISPLAY_DELAY_DURATION } from '../constants';
import { BECOME_MERCHANT_MEMBER_METHODS, PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import {
  actions as appActions,
  getBusinessInfo,
  getUserIsLogin,
  getUserConsumerId,
  getIsUserProfileStatusFulfilled,
  getUserProfile,
  getIsWebview,
  getBusiness,
} from '../../../../../redux/modules/app';
import { getOrder } from '../../../redux/selector';
import { loadOrder } from '../../../redux/thunks';
import { joinMembership } from '../../../../../../redux/modules/membership/thunks';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import logger from '../../../../../../utils/monitoring/logger';
import { getRedirectFrom } from './selector';
import config from '../../../../../../config';

export const loadCashbackInfo = createAsyncThunk('ordering/orderStatus/thankYou/fetchCashbackInfo', async orderId => {
  try {
    const { url, queryParams } = API_INFO.getCashbackInfo(orderId, Constants.CASHBACK_SOURCE.QR_ORDERING);
    const result = await get(url, { queryParams });

    return result;
  } catch (e) {
    logger.error('Ordering_ThankYou_LoadCashbackInfoFailed', { message: e?.message });

    throw e;
  }
});

export const createCashbackInfo = createAsyncThunk(
  'ordering/orderStatus/thankYou/createCashbackInfo',
  async ({ receiptNumber, phone }) => {
    const result = await post(API_INFO.createCashbackInfo().url, {
      receiptNumber,
      phone,
      source: Constants.CASHBACK_SOURCE.QR_ORDERING,
    });

    return result;
  }
);

export const loadStoreIdHashCode = createAsyncThunk(
  'ordering/orderStatus/thankYou/fetchStoreIdHashCode',
  async storeId => {
    const { url, queryParams } = API_INFO.getStoreIdHashCode(storeId);
    const result = await get(url, { queryParams });

    return result;
  }
);

export const loadStoreIdTableIdHashCode = createAsyncThunk(
  'ordering/orderStatus/thankYou/fetchStoreIdTableIdHashCode',
  async ({ storeId, tableId }) => {
    const result = await post(API_INFO.createStoreIdTableIdHashCode(storeId).url, {
      tableId,
    });

    return result;
  }
);

export const cancelOrder = createAsyncThunk(
  'ordering/orderStatus/common/cancelOrder',
  async ({ orderId, reason, detail }, { dispatch, getState }) => {
    const order = getOrder(getState());
    const businessInfo = getBusinessInfo(getState());

    try {
      await put(API_INFO.cancelOrder(orderId).url, { reason, detail });

      CleverTap.pushEvent('Thank you Page - Cancel Reason(Cancellation Confirmed)', {
        'store name': _get(order, 'storeInfo.name', ''),
        'store id': _get(order, 'storeId', ''),
        'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
        'order amount': _get(order, 'total', ''),
        country: _get(businessInfo, 'country', ''),
        'Reason for cancellation': reason,
        otherReasonSpecification: detail,
      });

      window.location.reload();
    } catch (e) {
      logger.error('Ordering_ThankYou_CancelOrderFailed', { message: e?.message });

      if (e.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch(appActions.showApiErrorModal(e.code));
      } else {
        alert(i18next.t('OrderingThankYou:SomethingWentWrongWhenCancelingYourOrder'), {
          title: i18next.t('OrderingThankYou:CancellationError'),
        });
      }

      throw e;
    }
  }
);

export const updateOrderShippingType = createAsyncThunk(
  'ordering/orderStatus/common/updateOrderShippingType',
  async ({ orderId, shippingType }, { dispatch }) => {
    try {
      await post(API_INFO.updateOrderShippingType(orderId).url, { value: shippingType });
      await dispatch(loadOrder(orderId));
    } catch (e) {
      if (e.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch(appActions.showApiErrorModal(e.code));
      } else {
        alert(i18next.t('ApiError:57002Description'), { title: i18next.t('ApiError:57002Title') });
      }

      throw e;
    }
  }
);

export const loadFoodCourtIdHashCode = createAsyncThunk(
  'ordering/orderStatus/thankYou/loadFoodCourtIdHashCode',
  async ({ foodCourtId, tableId }) => {
    try {
      const result = await postFoodCourtIdHashCode(foodCourtId, {
        tableId,
      });

      return result;
    } catch (e) {
      logger.error('Ordering_ThankYou_LoadFoodCourtHashCodeFailed', { message: e?.message });

      throw e;
    }
  }
);

export const showProfileModal = createAsyncThunk('ordering/orderStatus/thankYou/showProfileModal', async () => {});

export const hideProfileModal = createAsyncThunk('ordering/orderStatus/thankYou/hideProfileModal', async () => {});

export const callNativeProfile = createAsyncThunk(
  'ordering/profile/callNativeProfile',
  async (_, { dispatch, getState }) => {
    try {
      const { fulfilled } = await NativeMethods.showCompleteProfilePageAsync();

      if (fulfilled) {
        const consumerId = getUserConsumerId(getState());
        dispatch(appActions.loadProfileInfo(consumerId));
      }
    } catch (error) {
      logger.error('Ordering_OrderStatus_CallNativeProfileFailed', { message: error?.message });

      throw error;
    }
  }
);

export const updateRedirectFrom = createAsyncThunk('ordering/orderStatus/thankYou/updateRedirectFrom', async () => {
  const from = getCookieVariable('__ty_source');

  // immediately remove __ty_source cookie after setting in the state.
  removeCookieVariable('__ty_source');

  return from;
});

export const initProfilePage = createAsyncThunk(
  'ordering/orderStatus/thankYou/loadProfilePageInfo',
  async (_, { dispatch, getState }) => {
    try {
      // Delay Profile display duration
      const state = getState();
      const from = getRedirectFrom(state);
      const userIsLogin = getUserIsLogin(state);
      const consumerId = getUserConsumerId(state);
      const isUserProfileStatusFulfilled = getIsUserProfileStatusFulfilled(state);
      const isProfileMissingSkippedExpired = getIsProfileMissingSkippedExpired(state);
      const isWebview = getIsWebview(state);
      const delay = PROFILE_DISPLAY_DELAY_DURATION[from] || PROFILE_DISPLAY_DELAY_DURATION.DEFAULT;

      // First must to confirm profile info is loaded
      if (userIsLogin && !isUserProfileStatusFulfilled) {
        await dispatch(appActions.loadProfileInfo(consumerId));
      }

      const profile = getUserProfile(getState());
      const { name, email, birthday } = profile || {};
      const isProfileInfoIncomplete = !name || !email || !birthday;
      const isProfileModalShown = isProfileMissingSkippedExpired && isProfileInfoIncomplete && userIsLogin;

      if (isProfileModalShown) {
        setTimeout(async () => {
          if (isWebview) {
            await dispatch(callNativeProfile());
          } else {
            dispatch(showProfileModal());
          }
        }, delay);
      }
    } catch (error) {
      logger.error('Ordering_OrderStatus_InitProfileFailed', { message: error?.message });

      throw error;
    }
  }
);

/* Tiered Membership */
export const loadBusinessMembershipInfo = createAsyncThunk(
  'ordering/orderStatus/thankYou/loadBusinessMembershipInfo',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getBusiness(state);

    await dispatch(fetchMerchantInfo(business));
  }
);

export const joinBusinessMembership = createAsyncThunk(
  'ordering/orderStatus/thankYou/joinBusinessMembership',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const consumerId = getUserConsumerId(state);
    const source = BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK;

    await dispatch(joinMembership({ business, source, consumerId }));
    await dispatch(appActions.loadCustomerInfo(consumerId));
  }
);

export const goToJoinMembershipPage = createAsyncThunk(
  'ordering/orderStatus/thankYou/goToJoinMembershipPage',
  async (_, { getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const source = BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK;

    window.location.href = `${config.beepitComUrl}${PATH_NAME_MAPPING.REWARDS_BASE}${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.JOIN_MEMBERSHIP}?business=${business}&source=${source}`;
  }
);
