import qs from 'qs';
import {
  GET_STANDING_CENTS,
  SET_MESSAGE,
  SET_COMMON_DATA,
  SEND_OTP,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  RESET_OTP_INPUT,
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
    // const response = await api({
    //   url: `${Constants.api.CASHBACK}`,
    //   method: 'post',
    //   data: {
    //     phone,
    //     receiptNumber,
    //     source: GlobalConstants.CASHBACK_SOURCE.RECEIPT
    //   },
    // });
    // const { ok, data, error } = response;

    // dispatch(sendPhoneSuccess());

    // save phone
    // await dispatch(savePhone(phone));

    // if (data.customerId) {
    // dispatch(setCustomerId({ customerId: data.customerId }));
    // }

    // if (data.status === 'NotClaimed') {
    //   history.push(GlobalConstants.ROUTER_PATHS.ERROR, {
    //     message: ,
    //   });

    //   return;
    // }

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
