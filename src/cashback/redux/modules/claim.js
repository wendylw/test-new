import _get from 'lodash/get';
import { replace } from 'connected-react-router';
import { createSelector } from 'reselect';
import i18next from 'i18next';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import { CLAIM_TYPES } from '../types';
import Constants from '../../../utils/constants';
import { getPrice, getQueryString, getEncodeURIComponent } from '../../../common/utils';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import {
  actions as appActions,
  getBusiness,
  getBusinessLocale,
  getBusinessCurrency,
  getBusinessCountry,
  getIsUserLogin,
} from './app';
import { getCustomerId } from './customer/selectors';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

export const initialState = {
  cashbackInfo: null,
  receiptNumber: null,
};

export const types = CLAIM_TYPES;

export const actions = {
  getCashbackInfo: receiptNumber => ({
    [API_REQUEST]: {
      types: [types.FETCH_CASHBACKINFO_REQUEST, types.FETCH_CASHBACKINFO_SUCCESS, types.FETCH_CASHBACKINFO_FAILURE],
      ...Url.API_URLS.GET_CASHBACK,
      params: {
        receiptNumber,
        source: Constants.CASHBACK_SOURCE.RECEIPT,
      },
    },
  }),

  createCashbackInfo: receiptNumber => ({
    [API_REQUEST]: {
      types: [types.CREATE_CASHBACKINFO_REQUEST, types.CREATE_CASHBACKINFO_SUCCESS, types.CREATE_CASHBACKINFO_FAILURE],
      ...Url.API_URLS.POST_CASHBACK,
      payload: {
        receiptNumber,
        phone: Utils.getLocalStorageVariable('user.p'),
        source: Constants.CASHBACK_SOURCE.RECEIPT,
        registrationTouchpoint: Utils.getRegistrationTouchPoint(),
        registrationSource: Utils.getRegistrationSource(),
      },
    },
  }),

  getCashbackReceiptNumber: hash => ({
    [API_REQUEST]: {
      types: [types.FETCH_RECEIPTNUMBER_REQUEST, types.FETCH_RECEIPTNUMBER_SUCCESS, types.FETCH_RECEIPTNUMBER_FAILURE],
      ...Url.API_URLS.GET_CASHBACK_HASH_DATA(hash),
    },
  }),

  claimCashbackForConsumer: receiptNumber => async (dispatch, getState) => {
    if (!receiptNumber) {
      return;
    }

    await dispatch(actions.createCashbackInfo(receiptNumber));

    // eslint-disable-next-line no-use-before-define
    const customerId = getClaimedCashbackCustomerId(getState());

    customerId && dispatch(replace(`${Constants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`));
  },

  mounted: () => async (dispatch, getState) => {
    dispatch(appActions.setLoginPrompt(i18next.t('Common:ClaimCashbackTitle')));
    const hash = getEncodeURIComponent(getQueryString('h'));

    try {
      if (hash) {
        await dispatch(actions.getCashbackReceiptNumber(hash));
      }

      // eslint-disable-next-line no-use-before-define
      const receiptNumber = getReceiptNumber(getState());
      const isLogin = getIsUserLogin(getState());

      if (receiptNumber) {
        dispatch(actions.getCashbackInfo(receiptNumber));
      }

      if (isLogin && receiptNumber) {
        await dispatch(actions.claimCashbackForConsumer(receiptNumber));
      }
    } catch (error) {
      console.error(error);
    }
  },

  resetData: () => ({
    type: types.RESET_CLAIM_INFO_REQUEST,
  }),
};

// reducer
const reducer = (state = initialState, action) => {
  const { response } = action;

  switch (action.type) {
    case types.FETCH_CASHBACKINFO_REQUEST:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: true,
        },
      };
    case types.CREATE_CASHBACKINFO_REQUEST:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          cashbackClaimStatus: API_REQUEST_STATUS.PENDING,
          isFetching: true,
        },
      };
    case types.FETCH_RECEIPTNUMBER_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_CASHBACKINFO_FAILURE:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: false,
        },
      };
    case types.CREATE_CASHBACKINFO_FAILURE:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          cashbackClaimStatus: API_REQUEST_STATUS.REJECTED,
          isFetching: false,
        },
      };
    case types.FETCH_RECEIPTNUMBER_FAILURE:
      return { ...state, isFetching: false };
    case types.FETCH_CASHBACKINFO_SUCCESS: {
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          ...response,
          isFetching: false,
          loadedCashbackInfo: true,
          createdCashbackInfo: false,
        },
      };
    }
    case types.CREATE_CASHBACKINFO_SUCCESS: {
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          ...response,
          isFetching: false,
          loadedCashbackInfo: false,
          createdCashbackInfo: true,
          cashbackClaimStatus: API_REQUEST_STATUS.FULFILLED,
        },
      };
    }
    case types.FETCH_RECEIPTNUMBER_SUCCESS: {
      const { receiptNumber } = response || {};

      return {
        ...state,
        isFetching: false,
        receiptNumber,
      };
    }
    case types.RESET_CLAIM_INFO_REQUEST:
      return initialState;
    default:
      return state;
  }
};

export default reducer;

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
};

export const isFetchingCashbackInfo = state => state.claim.isFetching;
export const getCashbackInfo = state => state.claim.cashbackInfo;
export const getReceiptNumber = state => state.claim.receiptNumber;

export const getCashbackClaimRequestStatus = createSelector(getCashbackInfo, cashbackInfo =>
  _get(cashbackInfo, 'cashbackClaimStatus', null)
);

export const getIsCashbackClaimRequestPending = createSelector(
  getCashbackClaimRequestStatus,
  cashbackClaimRequestStatus => cashbackClaimRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsCashbackClaimRequestFulfilled = createSelector(
  getCashbackClaimRequestStatus,
  cashbackClaimRequestStatus => cashbackClaimRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getOrderCashbackStoreCity = createSelector(getCashbackInfo, cashbackInfo =>
  _get(cashbackInfo, 'order.store.city', null)
);

export const getOrderCashback = createSelector(getCashbackInfo, cashbackInfo => _get(cashbackInfo, 'cashback', null));

export const getOrderCustomerId = createSelector(getCashbackInfo, cashbackInfo =>
  _get(cashbackInfo, 'customerId', null)
);

export const getOrderCashbackPrice = createSelector(
  getOrderCashback,
  getBusinessLocale,
  getBusinessCurrency,
  getBusinessCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country })
);

export const getOrderCashbackPercentage = createSelector(getCashbackInfo, cashbackInfo => {
  const { defaultLoyaltyRatio } = cashbackInfo || {};

  return `${defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : 5}%`;
});

export const getOrderCashbackValue = createSelector(
  getOrderCashback,
  getOrderCashbackPrice,
  getOrderCashbackPercentage,
  (cashback, orderCashbackPrice, orderCashbackPercentage) => {
    const isNumber = Number(cashback) && !Number.isNaN(Number(cashback));

    return isNumber ? orderCashbackPrice : orderCashbackPercentage;
  }
);

export const getClaimedCashbackCustomerId = createSelector(
  getCustomerId,
  getOrderCustomerId,
  (customerId, orderCustomerId) => customerId || orderCustomerId
);
