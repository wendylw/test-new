import qs from 'qs';
import {
  GET_STANDING_CENTS,
  GET_BUSINESS,
  SET_MESSAGE,
  SET_ONLINE_STORE_NIFO,
  SET_HASH_DATA,
  SET_COMMON_DATA,
  SET_CUSTOMER_ID,
  SET_CASHBACK_HISTORY,
  SEND_OTP,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  RESET_OTP_INPUT,
  SET_PHONE,
  SEND_PHONE_REQUEST,
  SEND_PHONE_SUCCESS,
  SEND_PHONE_FAILURE,
} from "./types";
import api from "../../utils/api";
import GlobalConstants from '../../Constants';
import Constants from "../utils/Constants";

export const getStandingCents = payload => async (dispatch) => {
  // TODO: call the real api
  const { data } = await api('/ping');

  // data := { items }
  // items := [ item ]
  // item := { money, name, value }

  dispatch({
    type: GET_STANDING_CENTS,
    payload: data,
  });
}

export const getCashbackHistory = ({ customerId }) => async (dispatch) => {
  try {
    const { ok, data } = await api({
      url: `${Constants.api.HISTORY}/?customerId=${customerId}`,
      method: 'get',
    });

    if (ok) {
      dispatch({
        type: SET_CASHBACK_HISTORY,
        payload: {
          filters: { customerId },
          ...data,
        },
      })
    }
  } catch (e) {
    console.error(e);
  }
};

export const getCashbackInfo = receiptNumber => async (dispatch) => {
  try {
    const { ok, data } = await api({
      url: `${Constants.api.CASHBACK}?receiptNumber=${receiptNumber}&source=${GlobalConstants.CASHBACK_SOURCE.RECEIPT}`,
      method: 'get',
    });

    if (ok) {
      dispatch({
        type: SET_COMMON_DATA,
        payload: data,
      });

      if (!data.cashback) {
        dispatch(sendMessage({
          errorStatus: 'Invalid',
        }));
      }

      if (data.status) {
        await dispatch(sendMessage({ errorStatus: data.status }));
      }
    }
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }
};

export const resetOtpInput = () => ({
  type: RESET_OTP_INPUT,
  payload: {
    otpRenderTime: Date.now(),
  },
});

/**
 *
 * @param {*} phone
 * @param {*} otp (removed)
 * @param {*} phoneCountryCode  (removed)
 * @param {*} history
 */
export const tryOtpAndSaveCashback = history => async (dispatch, getState) => {
  try {
    const phone = getState().user.phone;
    const receiptNumber = getState().common.hashData.receiptNumber;

    // dispatch(sendPhoneRequest());
    const response = await api({
      url: `${Constants.api.CASHBACK}`,
      method: 'post',
      data: {
        phone,
        receiptNumber,
        source: GlobalConstants.CASHBACK_SOURCE.RECEIPT
      },
    });
    const { ok, data, error } = response;

    if (!ok) {
      // dispatch(sendPhoneFailure());
      dispatch(resetOtpInput());
      dispatch(sendMessage({
        message: error.message
      }));
      return;
    }

    // dispatch(sendPhoneSuccess());

    // save phone
    // await dispatch(savePhone(phone));

    // if (data.customerId) {
    // dispatch(setCustomerId({ customerId: data.customerId }));
    // }

    if (data.status === 'NotClaimed') {
      history.push(GlobalConstants.ROUTER_PATHS.ERROR, {
        message: 'Looks like something went wrong. Please scan the QR again, or ask the staff for help.',
      });

      return;
    }

    const errorOptions = {
      errorStatus: data.status,
    };

    await dispatch(sendMessage(errorOptions));
  } catch (e) {
    // TODO: handle error
    console.error(e);
    // dispatch(sendPhoneFailure());
  }

  const queryString = qs.stringify({
    customerId: getState().user.customerId,
    // h: getState().common.hashData.h,
  }, { addQueryPrefix: true });

  history.push(`${GlobalConstants.ROUTER_PATHS.CASHBACK_HOME}${queryString}`);
};

export const sendOtp = phone => async (dispatch, getState) => {
  try {
    // not yet available to resend
    if (getState().user.otpCountDown > 0) {
      console.warn(`OTP can be sent after ${getState().user.otpCountDown} seconds.`);
      return;
    }

    dispatch({
      type: SEND_OTP,
      payload: { otpStatus: 'sending' },
    });

    const { ok } = await api({
      url: Constants.api.CODE,
      method: 'post',
      data: { phone },
    });

    if (ok) {
      let otpCountDown = GlobalConstants.OTP_TIMEOUT;

      dispatch({
        type: SEND_OTP_SUCCESS,
        payload: {
          otpCountDown,
          otpStatus: 'sent',
        },
      });

      const timer = setInterval(() => {
        if (otpCountDown <= 0) {
          clearInterval(timer);
          return;
        }

        otpCountDown = otpCountDown - 1;

        dispatch({
          type: SEND_OTP,
          payload: { otpCountDown },
        });
      }, 1000);
    } else {
      dispatch(sendMessage({
        errorStatus: 'NotSent_OTP',
      }));
      dispatch({
        type: SEND_OTP_FAILURE,
        payload: {
          otpCountDown: 0,
          otpStatus: 'readyToSend',
        },
      });
    }
  } catch (e) {
    console.error(e);
    dispatch({
      type: SEND_OTP_FAILURE,
      payload: {
        otpCountDown: 0,
        otpStatus: 'readyToSend',
      },
    });
  }
};

export const sendMessage = ({ errorStatus, message = '' }) => ({
  type: SET_MESSAGE,
  payload: {
    errorStatus: errorStatus || '',
    message,
    show: true,
  },
});

export const clearMessage = payload => ({
  type: SET_MESSAGE,
  payload: {
    errorStatus: '',
    message: '',
    show: false,
  },
});
