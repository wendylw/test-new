/* eslint-disable no-use-before-define */
import { combineReducers } from 'redux';
import _get from 'lodash/get';
import _cloneDeep from 'lodash/cloneDeep';
import Constants, { API_REQUEST_STATUS } from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import config from '../../../../config';
import Url from '../../../../utils/url';
import { APP_TYPES } from './types';
import { API_REQUEST } from '../../../../redux/middlewares/api';
import { post } from '../../../../utils/api/api-fetch';
import logger from '../../../../utils/monitoring/logger';
import { AVAILABLE_COUNTRIES } from '../../../../common/utils/phone-number-constants';

const { AUTH_INFO, OTP_REQUEST_PLATFORM, OTP_REQUEST_TYPES } = Constants;
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');

export const types = APP_TYPES;

export const initialState = {
  user: {
    isError: false,
    sendOtpRequest: {
      data: null,
      status: null,
      error: null,
    },
    otpRequest: {
      data: {
        type: OTP_REQUEST_TYPES.OTP,
      },
      status: null,
      error: null,
    },
    country: Utils.getCountry(localePhoneNumber, navigator.language, AVAILABLE_COUNTRIES, 'MY'),
    phone: localePhoneNumber || '',
    noWhatsAppAccount: true,
  },
};

// action creators
export const actions = {
  getPhoneWhatsAppSupport: phone => async dispatch => {
    try {
      dispatch({ type: types.GET_WHATSAPPSUPPORT_REQUEST });

      const { supportWhatsApp } = await post(Url.API_URLS.GET_WHATSAPP_SUPPORT.url, {
        phone,
      });

      dispatch({ type: types.GET_WHATSAPPSUPPORT_SUCCESS, response: { supportWhatsApp } });
    } catch (error) {
      dispatch({
        type: types.GET_WHATSAPPSUPPORT_FAILURE,
        error,
      });
    }
  },

  resetGetOtpRequest: () => ({
    type: types.RESET_GET_OTP_REQUEST,
  }),

  getOtp: payload => async dispatch => {
    try {
      const { type: otpType } = payload;

      logger.log('Ordering_App_StartToGetOTP');

      dispatch({ type: types.GET_OTP_REQUEST, payload: { otpType } });

      await post(Url.API_URLS.GET_OTP.url, {
        ...payload,
        platform: OTP_REQUEST_PLATFORM,
      });

      dispatch({ type: types.GET_OTP_SUCCESS });
    } catch (error) {
      dispatch({
        type: types.GET_OTP_FAILURE,
        error,
      });
    }
  },

  resetSendOtpRequest: () => ({
    type: types.RESET_SEND_OTP_REQUEST,
  }),

  sendOtp: ({ otp }) => ({
    [API_REQUEST]: {
      types: [types.SEND_OTP_REQUEST, types.SEND_OTP_SUCCESS, types.SEND_OTP_FAILURE],
      ...Url.API_URLS.POST_OTP(config.authApiUrl),
      payload: {
        grant_type: AUTH_INFO.GRANT_TYPE,
        client: AUTH_INFO.CLIENT,
        business_name: config.business,
        username: Utils.getLocalStorageVariable('user.p'),
        password: otp,
      },
    },
  }),
  updateUser: (user = {}) => ({
    type: types.UPDATE_USER,
    user,
  }),
};

const user = (state = initialState.user, action) => {
  const { type, response, error, payload } = action;
  const { supportWhatsApp, access_token: accessToken, refresh_token: refreshToken } = response || {};

  const otpType = _get(payload, 'otpType', null);

  switch (type) {
    case types.RESET_SEND_OTP_REQUEST:
      return { ...state, sendOtpRequest: _cloneDeep(initialState.user.sendOtpRequest) };
    case types.SEND_OTP_REQUEST:
      return {
        ...state,
        sendOtpRequest: {
          ...state.sendOtpRequest,
          status: API_REQUEST_STATUS.PENDING,
          error: null,
        },
      };
    case types.SEND_OTP_SUCCESS:
      return {
        ...state,
        sendOtpRequest: {
          ...state.sendOtpRequest,
          data: { accessToken, refreshToken },
          status: API_REQUEST_STATUS.FULFILLED,
        },
      };
    case types.SEND_OTP_FAILURE:
      return {
        ...state,
        sendOtpRequest: {
          ...state.sendOtpRequest,
          status: API_REQUEST_STATUS.REJECTED,
          error,
        },
      };
    case types.RESET_GET_OTP_REQUEST:
      return { ...state, otpRequest: _cloneDeep(initialState.user.otpRequest) };
    case types.GET_OTP_REQUEST:
      return {
        ...state,
        otpRequest: {
          ...state.otpRequest,
          data: { ...state.otpRequest.data, type: otpType },
          status: API_REQUEST_STATUS.PENDING,
          error: null,
        },
      };
    case types.GET_OTP_FAILURE:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.REJECTED, error } };
    case types.GET_OTP_SUCCESS:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.FULFILLED } };
    case types.UPDATE_USER:
      return {
        ...state,
        ...action.user,
      };
    case types.GET_WHATSAPPSUPPORT_REQUEST:
      return { ...state, noWhatsAppAccount: true };
    case types.GET_WHATSAPPSUPPORT_SUCCESS:
      return { ...state, noWhatsAppAccount: !supportWhatsApp };
    case types.GET_WHATSAPPSUPPORT_FAILURE:
      // Write down here just for the sake of completeness, we won't handle this failure case for now.
      return state;
    default:
      return state;
  }
};

export default combineReducers({
  user,
});

// selectors

export const getUser = state => state.app.user;
export const getOtpRequest = state => state.app.user.otpRequest;
export const getSendOtpRequest = state => state.app.user.sendOtpRequest;
