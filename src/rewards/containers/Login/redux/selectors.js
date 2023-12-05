import _get from 'lodash/get';
import { createSelector } from 'reselect';
import Constants, {
  OTP_BFF_ERROR_CODES,
  OTP_API_ERROR_CODES,
  SMS_API_ERROR_CODES,
  OTP_COMMON_ERROR_TYPES,
  OTP_SERVER_ERROR_I18N_KEYS,
  OTP_ERROR_POPUP_I18N_KEYS,
} from '../../../../utils/constants';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import {
  getOtpRequest,
  getIsLoginRequestStatusPending,
  getIsQrOrderingShippingType,
  getIsGuestLoginDisabled,
} from '../../../redux/modules/app';
import { ERROR_TYPES } from '../../../../utils/api/constants';

const { OTP_REQUEST_TYPES } = Constants;

export const getOtpRequestStatus = createSelector(getOtpRequest, otp => otp.status);

export const getOtpRequestError = createSelector(getOtpRequest, otp => otp.error);

export const getOtpType = createSelector(getOtpRequest, otp => _get(otp, 'data.type', null));

export const getOtpErrorCode = createSelector(getOtpRequestError, error => _get(error, 'code', null));

export const getOtpErrorName = createSelector(getOtpRequestError, error => _get(error, 'name', null));

export const getIsOtpRequestStatusPending = createSelector(
  getOtpRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getIsOtpRequestStatusRejected = createSelector(
  getOtpRequestStatus,
  status => status === API_REQUEST_STATUS.REJECTED
);

export const getIsOtpRequestStatusFulfilled = createSelector(
  getOtpRequestStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getIsOtpInitialRequest = createSelector(getOtpType, otpType => otpType === OTP_REQUEST_TYPES.OTP);

export const getIsOtpInitialRequestFailed = createSelector(
  getIsOtpInitialRequest,
  getIsOtpRequestStatusRejected,
  (isOtpInitialRequest, isOtpRequestStatusRejected) => isOtpInitialRequest && isOtpRequestStatusRejected
);

export const getIsDisplayableOtpError = createSelector(getOtpErrorCode, errorCode =>
  [
    OTP_BFF_ERROR_CODES.PHONE_INVALID,
    OTP_API_ERROR_CODES.PHONE_INVALID,
    OTP_API_ERROR_CODES.MEET_DAY_LIMIT,
    OTP_API_ERROR_CODES.REQUEST_TOO_FAST,
    SMS_API_ERROR_CODES.PHONE_INVALID,
    SMS_API_ERROR_CODES.NO_AVAILABLE_PROVIDER,
  ].some(code => errorCode === code.toString())
);

export const getIsOtpErrorFieldVisible = createSelector(
  getIsOtpInitialRequestFailed,
  getIsDisplayableOtpError,
  (isOtpInitialRequestFailed, isDisplayableOtpError) => isOtpInitialRequestFailed && isDisplayableOtpError
);

export const getOtpErrorTextI18nKey = createSelector(
  getOtpErrorCode,
  errorCode => OTP_SERVER_ERROR_I18N_KEYS[errorCode]
);

export const getShouldShowErrorPopUp = createSelector(
  getIsOtpInitialRequest,
  getIsDisplayableOtpError,
  getIsOtpRequestStatusRejected,
  (isOtpInitialRequest, isDisplayableOtpError, isRequestRejected) => {
    if (!isRequestRejected) return false;

    if (isOtpInitialRequest) return !isDisplayableOtpError;

    return true;
  }
);

export const getShouldShowNetworkErrorPopUp = createSelector(
  getOtpErrorName,
  errorName => errorName === ERROR_TYPES.NETWORK_ERROR
);

export const getShouldShowOtpApiErrorPopUp = createSelector(
  getOtpErrorCode,
  getIsOtpInitialRequest,
  (errorCode, isOtpInitialRequest) => {
    const isHighRiskError = errorCode === OTP_API_ERROR_CODES.HIGH_RISK.toString();

    if (isHighRiskError) return true;

    const isReachedDailyLimitError = errorCode === OTP_API_ERROR_CODES.MEET_DAY_LIMIT.toString();

    return !isOtpInitialRequest && isReachedDailyLimitError;
  }
);

export const getOtpErrorPopUpI18nKeys = createSelector(
  getOtpErrorCode,
  getShouldShowOtpApiErrorPopUp,
  getShouldShowNetworkErrorPopUp,
  (errorCode, shouldShowOtpApiErrorPopUp, shouldShowNetworkErrorPopUp) =>
    shouldShowOtpApiErrorPopUp
      ? OTP_ERROR_POPUP_I18N_KEYS[errorCode]
      : shouldShowNetworkErrorPopUp
      ? OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.NETWORK_ERROR]
      : OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.UNKNOWN_ERROR]
);

export const getShouldShowLoader = createSelector(
  getIsOtpRequestStatusPending,
  getIsLoginRequestStatusPending,
  (isOtpRequestStatusPending, isLoginRequestStatusPending) => isOtpRequestStatusPending || isLoginRequestStatusPending
);

export const getShouldShowGuestOption = createSelector(
  getIsGuestLoginDisabled,
  getIsQrOrderingShippingType,
  (isGuestLoginDisabled, isQrOrderingShippingType) => isQrOrderingShippingType && !isGuestLoginDisabled
);
