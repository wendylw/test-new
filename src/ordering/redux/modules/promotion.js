import { PROMOTION_TYPES } from '../types';
import Url from '../../../utils/url';
import Constants from '../../../utils/constants';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getPromotion } from '../../../redux/modules/entities/carts';
import { actions as appActions } from './app';
import i18next from 'i18next';
import Utils from '../../../utils/utils';
const { PROMOTION_APPLIED_STATUS, PROMO_TYPE } = Constants;

const initialState = {
  promoCode: '',
  status: '',
  validFrom: '',
  inProcess: false,
  promoType: '',
};

export const actions = {
  applyPromoCode: () => async (dispatch, getState) => {
    const state = getState();
    const promoCode = state.promotion.promoCode;

    const result = await dispatch({
      [API_REQUEST]: {
        types: [
          PROMOTION_TYPES.APPLY_PROMOTION_CODE_REQUEST,
          PROMOTION_TYPES.APPLY_PROMOTION_CODE_SUCCESS,
          PROMOTION_TYPES.APPLY_PROMOTION_CODE_FAILURE,
        ],
        ...Url.API_URLS.APPLY_PROMOTION_CODE,
        payload: {
          promoCode,
          fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom,
          shippingType: Utils.getApiRequestShippingType(),
        },
      },
    });

    if (result.type === PROMOTION_TYPES.APPLY_PROMOTION_CODE_FAILURE) {
      await dispatch(actions.applyVoucher(promoCode));
    }

    if (result.type === PROMOTION_TYPES.APPLY_PROMOTION_CODE_SUCCESS) {
      const { response: applyPromoResult = {} } = result;
      // If success is false, then this promo exists but not valid for some reason
      if (applyPromoResult.success === true) {
        await dispatch({
          type: PROMOTION_TYPES.APPLY_PROMO_SUCCESS,
          response: result.response,
        });
      } else if (
        applyPromoResult.success === false &&
        applyPromoResult.status !== PROMOTION_APPLIED_STATUS.NOT_EXISTED
      ) {
        await dispatch({
          type: PROMOTION_TYPES.APPLY_PROMO_FAILED,
          response: result.response,
        });
      } else {
        await dispatch(actions.applyVoucher(promoCode));
      }
    }

    return result;
  },
  applyVoucher: () => async (dispatch, getState) => {
    const state = getState();
    const promoCode = state.promotion.promoCode;

    const result = await dispatch({
      [API_REQUEST]: {
        types: [
          PROMOTION_TYPES.APPLY_VOUCHER_REQUEST,
          PROMOTION_TYPES.APPLY_VOUCHER_SUCCESS,
          PROMOTION_TYPES.APPLY_VOUCHER_FAILURE,
        ],
        ...Url.API_URLS.APPLY_VOUCHER_CODE,
        payload: {
          voucherCode: promoCode,
          fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom,
          shippingType: Utils.getApiRequestShippingType(),
        },
      },
    });

    if (result.type === PROMOTION_TYPES.APPLY_VOUCHER_FAILURE) {
      dispatch(
        appActions.showError({
          message: i18next.t('ConnectionIssue'),
        })
      );
    }

    return result;
  },
  dismissPromotion: () => async (dispatch, getState) => {
    const state = getState();
    const promotion = getPromotion(state);
    const promoCode = promotion ? promotion.promoCode : '';
    const promoType = promotion ? promotion.promoType : '';
    const dismissType =
      promoType === PROMO_TYPE.PROMOTION
        ? 'DISMISS_PROMOTION_CODE'
        : promoType === PROMO_TYPE.VOUCHER
        ? 'DISMISS_VOUCHER_CODE'
        : '';

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
              ? Utils.getFulfillDate().expectDeliveryDateFrom
              : undefined,
          shippingType: dismissType === 'DISMISS_PROMOTION_CODE' ? Utils.getApiRequestShippingType() : undefined,
        },
      },
    });

    if (result.type === PROMOTION_TYPES.DISMISS_PROMOTION_CODE_FAILURE) {
      dispatch(
        appActions.showError({
          message: i18next.t('ConnectionIssue'),
        })
      );
    }

    return result;
  },
  updatePromoCode: promoCode => ({
    type: PROMOTION_TYPES.UPDATE_PROMOTION_CODE,
    promoCode,
  }),
  initialPromotion: () => ({
    type: PROMOTION_TYPES.INITIAL_PROMOTION_CODE,
  }),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PROMOTION_TYPES.APPLY_PROMOTION_CODE_REQUEST:
      return {
        ...state,
        inProcess: true,
      };
    case PROMOTION_TYPES.APPLY_PROMOTION_CODE_SUCCESS:
      return {
        ...state,
        inProcess: false,
      };
    case PROMOTION_TYPES.APPLY_PROMOTION_CODE_FAILURE:
      return {
        ...state,
        inProcess: false,
      };
    case PROMOTION_TYPES.APPLY_VOUCHER_REQUEST:
      return {
        ...state,
        inProcess: true,
      };
    case PROMOTION_TYPES.APPLY_VOUCHER_SUCCESS:
      return {
        ...state,
        status: action.response.status,
        promoType: PROMO_TYPE.VOUCHER,
        validFrom: new Date(action.response.validFrom),
        inProcess: false,
      };
    case PROMOTION_TYPES.APPLY_PROMO_SUCCESS:
    case PROMOTION_TYPES.APPLY_PROMO_FAILED:
      return {
        ...state,
        status: action.response.status,
        promoType: PROMO_TYPE.PROMOTION,
        validFrom: new Date(action.response.validFrom),
        inProcess: false,
      };
    case PROMOTION_TYPES.APPLY_VOUCHER_FAILURE:
      return {
        ...state,
        inProcess: false,
      };
    case PROMOTION_TYPES.UPDATE_PROMOTION_CODE:
      return {
        ...state,
        promoCode: action.promoCode,
        status: '',
      };
    case PROMOTION_TYPES.INITIAL_PROMOTION_CODE:
      return {
        ...state,
        ...initialState,
      };
    default:
      return state;
  }
};

export default reducer;

export function getPromoCode(state) {
  return state.promotion.promoCode;
}

export function getPromoValidFrom(state) {
  return state.promotion.validFrom;
}

export function getStatus(state) {
  return state.promotion.status;
}

export function isAppliedSuccess(state) {
  return state.promotion.status === PROMOTION_APPLIED_STATUS.VALID;
}

export function isAppliedError(state) {
  return state.promotion.status && state.promotion.status !== PROMOTION_APPLIED_STATUS.VALID;
}

export function isInProcess(state) {
  return state.promotion.inProcess;
}
