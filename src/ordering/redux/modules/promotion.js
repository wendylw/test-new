/* eslint-disable no-use-before-define */
import _get from 'lodash/get';
import { PROMOTION_TYPES } from '../types';
import Url from '../../../utils/url';
import Constants, { API_REQUEST_STATUS } from '../../../utils/constants';
import Utils from '../../../utils/utils';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getVoucherConsumerList, getSearchPromotionInfo } from './api-request';
import { getBusiness, getBusinessUTCOffset, getCartBilling, getUserConsumerId } from './app';

const { PROMO_TYPE } = Constants;

const initialState = {
  promoCode: '',
  appliedResult: null,
  inProcess: false,
  voucherList: {},
  isSearchMode: false, // when true, means in search mode, when user enter this page for the first time, display voucher list
  foundPromo: {},
  hasSearchedForPromo: false,
  selectedPromo: {},
  fetchVoucherListRequest: {
    status: null,
    error: null,
  },
  fetchPromoInfoRequest: {
    status: null,
    error: null,
  },
};

export const actions = {
  applyPromo: () => async (dispatch, getState) => {
    const state = getState();
    const { selectedPromo } = state.promotion;

    if (selectedPromo.type === PROMO_TYPE.PROMOTION) {
      await dispatch(actions.applyPromoCode());
    } else {
      await dispatch(actions.applyVoucher());
    }
  },
  applyPromoCode: () => async (dispatch, getState) => {
    const state = getState();
    const { selectedPromo } = state.promotion;
    const businessUTCOffset = getBusinessUTCOffset(state);

    const result = await dispatch({
      [API_REQUEST]: {
        types: [
          PROMOTION_TYPES.APPLY_PROMOTION_CODE_REQUEST,
          PROMOTION_TYPES.APPLY_PROMOTION_CODE_SUCCESS,
          PROMOTION_TYPES.APPLY_PROMOTION_CODE_FAILURE,
        ],
        ...Url.API_URLS.APPLY_PROMOTION_CODE,
        payload: {
          promoId: selectedPromo.id,
          fulfillDate: Utils.getFulfillDate(businessUTCOffset),
          shippingType: Utils.getApiRequestShippingType(),
        },
      },
    });

    return result;
  },
  applyVoucher: () => async (dispatch, getState) => {
    const state = getState();
    const { selectedPromo } = state.promotion;
    const businessUTCOffset = getBusinessUTCOffset(state);

    const result = await dispatch({
      [API_REQUEST]: {
        types: [
          PROMOTION_TYPES.APPLY_VOUCHER_REQUEST,
          PROMOTION_TYPES.APPLY_VOUCHER_SUCCESS,
          PROMOTION_TYPES.APPLY_VOUCHER_FAILURE,
        ],
        ...Url.API_URLS.APPLY_VOUCHER_CODE,
        payload: {
          voucherCode: selectedPromo.code,
          fulfillDate: Utils.getFulfillDate(businessUTCOffset),
          shippingType: Utils.getApiRequestShippingType(),
        },
      },
    });

    return result;
  },
  dismissPromotion: () => async (dispatch, getState) => {
    const state = getState();
    const { promotion } = getCartBilling(state) || {};
    const promoCode = promotion ? promotion.promoCode : '';
    const promoType = promotion ? promotion.promoType : '';
    const dismissType =
      promoType === PROMO_TYPE.PROMOTION
        ? 'DISMISS_PROMOTION_CODE'
        : promoType === PROMO_TYPE.VOUCHER
        ? 'DISMISS_VOUCHER_CODE'
        : '';
    const businessUTCOffset = getBusinessUTCOffset(state);

    const result = await dispatch({
      [API_REQUEST]: {
        types: [
          PROMOTION_TYPES.DISMISS_PROMOTION_CODE_REQUEST,
          PROMOTION_TYPES.DISMISS_PROMOTION_CODE_SUCCESS,
          PROMOTION_TYPES.DISMISS_PROMOTION_CODE_FAILURE,
        ],
        ...Url.API_URLS[dismissType],
        payload: {
          voucherCode: promoCode,
          fulfillDate:
            dismissType === 'DISMISS_VOUCHER_CODE' || dismissType === 'DISMISS_PROMOTION_CODE'
              ? Utils.getFulfillDate(businessUTCOffset)
              : undefined,
          shippingType: dismissType === 'DISMISS_PROMOTION_CODE' ? Utils.getApiRequestShippingType() : undefined,
        },
      },
    });

    if (result.type === PROMOTION_TYPES.DISMISS_PROMOTION_CODE_SUCCESS) {
      dispatch(actions.resetPromotion());
    }

    return result;
  },
  updatePromoCode: promoCode => dispatch => {
    dispatch({
      type: PROMOTION_TYPES.UPDATE_PROMOTION_CODE,
      promoCode,
    });
  },
  resetPromotion: () => ({
    type: PROMOTION_TYPES.INITIAL_PROMOTION_CODE,
  }),
  fetchConsumerVoucherList: () => async (dispatch, getState) => {
    try {
      dispatch({
        type: PROMOTION_TYPES.FETCH_CONSUMER_VOUCHER_LIST_REQUEST,
      });

      const state = getState();
      const consumerId = getUserConsumerId(state);
      const result = await getVoucherConsumerList(consumerId);

      await dispatch({
        type: PROMOTION_TYPES.FETCH_CONSUMER_VOUCHER_LIST_SUCCESS,
        response: {
          vouchers: result,
        },
      });
    } catch (error) {
      dispatch({
        type: PROMOTION_TYPES.FETCH_CONSUMER_VOUCHER_LIST_FAILURE,
        error: error?.message,
      });
    }
  },
  getPromoInfo: () => async (dispatch, getState) => {
    try {
      dispatch({
        type: PROMOTION_TYPES.FETCH_PROMO_INFO_REQUEST,
      });

      const state = getState();
      const promoCode = getPromoCode(state);
      const consumerId = getUserConsumerId(state);
      const business = getBusiness(state);
      const result = await getSearchPromotionInfo({ promoCode, consumerId, business });

      await dispatch({
        type: PROMOTION_TYPES.FETCH_PROMO_INFO_SUCCESS,
        response: {
          promos: result,
        },
      });
    } catch (error) {
      await dispatch({
        type: PROMOTION_TYPES.FETCH_PROMO_INFO_FAILURE,
        error: error?.message,
      });
    }
  },
  setSearchMode: isSearchingMode => async (dispatch, getState) => {
    await dispatch({
      type: PROMOTION_TYPES.UPDATE_SEARCH_MODE,
      isSearchingMode,
    });

    // clear selected promo when change to search mode
    const state = getState();
    const { selectedPromo, promoCode } = state.promotion;

    if (!promoCode && selectedPromo.id) {
      dispatch(actions.selectPromo({}));
    }
  },
  selectPromo: promo => (dispatch, getState) => {
    const state = getState();
    const { selectedPromo } = state.promotion;

    // Double click will invert the selection
    if (!promo || !promo.id || selectedPromo.id === promo.id) {
      dispatch({
        type: PROMOTION_TYPES.DESELECT_PROMO,
      });
    } else {
      dispatch({
        type: PROMOTION_TYPES.SELECT_PROMO,
        promo,
      });
    }
  },
};

const reducer = (state = initialState, action) => {
  const vouchers = _get(action.response, 'vouchers', []);
  const voucherList = {
    availablePromos: vouchers.filter(voucher => !voucher.expired && !voucher.invalidForWeb),
    unavailablePromos: vouchers.filter(voucher => voucher.expired || voucher.invalidForWeb),
    quantity: vouchers.length,
  };

  const promos = _get(action.response, 'promos', []);
  const foundPromo = {
    availablePromos: promos.filter(voucher => !voucher.expired && !voucher.invalidForWeb),
    unavailablePromos: promos.filter(voucher => voucher.expired || voucher.invalidForWeb),
    quantity: promos.length,
  };

  switch (action.type) {
    case PROMOTION_TYPES.APPLY_PROMOTION_CODE_FAILURE:
    case PROMOTION_TYPES.APPLY_VOUCHER_FAILURE:
      return {
        ...state,
        appliedResult: {
          success: false,
          code: action.code,
          extraInfo: action.extraInfo,
          errorMessage: action.message,
        },
        inProcess: false,
      };
    case PROMOTION_TYPES.APPLY_PROMOTION_CODE_REQUEST:
    case PROMOTION_TYPES.APPLY_VOUCHER_REQUEST:
      return {
        ...state,
        inProcess: true,
      };
    case PROMOTION_TYPES.APPLY_PROMOTION_CODE_SUCCESS:
    case PROMOTION_TYPES.APPLY_VOUCHER_SUCCESS:
      return {
        ...state,
        appliedResult: {
          success: true,
          code: '',
        },
        inProcess: false,
      };
    case PROMOTION_TYPES.UPDATE_PROMOTION_CODE:
      return {
        ...state,
        promoCode: action.promoCode,
        foundPromo: {},
        hasSearchedForPromo: false,
        selectedPromo: {},
        appliedResult: null,
      };
    case PROMOTION_TYPES.INITIAL_PROMOTION_CODE:
      return {
        ...state,
        ...initialState,
      };
    case PROMOTION_TYPES.FETCH_CONSUMER_VOUCHER_LIST_REQUEST:
      return {
        ...state,
        fetchVoucherListRequest: {
          status: API_REQUEST_STATUS.PENDING,
          error: null,
        },
      };
    case PROMOTION_TYPES.FETCH_CONSUMER_VOUCHER_LIST_SUCCESS:
      return {
        ...state,
        voucherList,
        fetchVoucherListRequest: {
          status: API_REQUEST_STATUS.FULFILLED,
          error: null,
        },
      };
    case PROMOTION_TYPES.FETCH_CONSUMER_VOUCHER_LIST_FAILURE:
      return {
        ...state,
        fetchVoucherListRequest: {
          status: API_REQUEST_STATUS.REJECTED,
          error: action.error,
        },
      };
    case PROMOTION_TYPES.FETCH_PROMO_INFO_REQUEST:
      return {
        ...state,
        fetchPromoInfoRequest: {
          status: API_REQUEST_STATUS.PENDING,
          error: null,
        },
      };
    case PROMOTION_TYPES.FETCH_PROMO_INFO_SUCCESS:
      return {
        ...state,
        foundPromo,
        hasSearchedForPromo: true,
        fetchPromoInfoRequest: {
          status: API_REQUEST_STATUS.FULFILLED,
          error: null,
        },
      };
    case PROMOTION_TYPES.FETCH_PROMO_INFO_FAILURE:
      return {
        ...state,
        fetchPromoInfoRequest: {
          status: API_REQUEST_STATUS.REJECTED,
          error: action.error,
        },
      };
    case PROMOTION_TYPES.UPDATE_SEARCH_MODE:
      return {
        ...state,
        searchMode: action.isSearchingMode,
      };
    case PROMOTION_TYPES.SELECT_PROMO:
      return {
        ...state,
        selectedPromo: action.promo,
      };
    case PROMOTION_TYPES.DESELECT_PROMO:
      return {
        ...state,
        selectedPromo: {},
      };
    default:
      return state;
  }
};

export default reducer;

export function getPromoCode(state) {
  return state.promotion.promoCode;
}

export function getPromoErrorCode(state) {
  return _get(state.promotion, 'appliedResult.code', '');
}

export function getAppliedResult(state) {
  return _get(state.promotion, 'appliedResult', null);
}

export function getIsAppliedSuccess(state) {
  return _get(state.promotion, 'appliedResult.success', false);
}

export function getIsAppliedError(state) {
  return !_get(state.promotion, 'appliedResult.success', true);
}

export function isInProcess(state) {
  return state.promotion.inProcess;
}

export function getVoucherList(state) {
  return state.promotion.voucherList;
}

export function getFoundPromotion(state) {
  return state.promotion.foundPromo;
}

export function isPromoSearchMode(state) {
  return state.promotion.searchMode;
}

export function hasSearchedForPromo(state) {
  return state.promotion.hasSearchedForPromo;
}

export function getSelectedPromo(state) {
  return state.promotion.selectedPromo;
}

export function getSelectedPromoId(state) {
  return _get(state.promotion, 'selectedPromo.id', '');
}

export function getSelectedPromoCode(state) {
  return _get(state.promotion, 'selectedPromo.code', '');
}
